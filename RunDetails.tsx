import { useEffect, useId, useRef } from 'react';
import type { Run } from '../types';
import './RunDetails.css';

interface RunDetailsProps {
  run: Run | null;
  onClose: () => void;
}

export const RunDetails = ({ run, onClose }: RunDetailsProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const statusLabels: Record<Run['status'], string> = {
    queued: 'В очереди',
    running: 'Выполняется',
    succeeded: 'Успешно',
    failed: 'Ошибка',
  };

  useEffect(() => {
    if (!run) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const dialog = dialogRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (activeElement === lastElement || !dialog.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
    };
  }, [run, onClose]);

  if (!run) return null;

  const formattedDate = new Date(run.createdAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <div>
            <h2 id={titleId}>{run.name}</h2>
            <p className="modal-repo">{run.repository} • {run.branch}</p>
          </div>
          <button
            ref={closeButtonRef}
            className="close-btn"
            type="button"
            onClick={onClose}
            title="Закрыть (Esc)"
            aria-label="Закрыть окно"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="meta-row">
            <span>
              Статус: <strong className={`status-badge status-${run.status}`}>{statusLabels[run.status]}</strong>
            </span>
            <span>Дата: {formattedDate}</span>
            {run.durationSeconds != null && <span>Длительность: {run.durationSeconds} сек.</span>}
          </div>

          <div className="section">
            <h3>Логи:</h3>
            <pre className="logs-box">{run.logs.join('\n')}</pre>
          </div>

          {run.result && (
            <div className="section">
              <h3>Результат:</h3>
              <div className="result-box">{run.result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
