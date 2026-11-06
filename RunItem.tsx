import type { KeyboardEvent } from 'react';
import type { Run } from '../types';
import './RunItem.css';

interface RunItemProps {
  run: Run;
  onClick: (run: Run) => void;
}

const STATUS_NAMES: Record<Run['status'], string> = {
  queued: 'В ОЧЕРЕДИ',
  running: 'ВЫПОЛНЯЕТСЯ',
  succeeded: 'УСПЕШНО',
  failed: 'ОШИБКА',
};

export const RunItem = ({ run, onClick }: RunItemProps) => {
  const formattedDate = new Date(run.createdAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDuration = run.durationSeconds != null
    ? `${Math.floor(run.durationSeconds / 60)}м ${run.durationSeconds % 60}с`
    : '—';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(run);
    }
  };

  return (
    <div
      className="run-item"
      onClick={() => onClick(run)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`Открыть детали запуска ${run.name}`}
    >
      <div className="run-info">
        <h3 className="run-name">{run.name}</h3>
        <p className="run-repo">
          {run.repository} <span className="run-branch">• {run.branch}</span>
        </p>
      </div>

      <div className="run-meta">
        <span className={`status-badge status-${run.status}`}>
          {STATUS_NAMES[run.status]}
        </span>
        <span className="run-date">{formattedDate}</span>
        <span className="run-duration">{formattedDuration}</span>
      </div>
    </div>
  );
};
