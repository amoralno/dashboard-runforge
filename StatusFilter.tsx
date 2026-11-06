import type { RunStatus } from '../types';

interface StatusFilterProps {
  currentFilter: RunStatus | 'all';
  onFilterChange: (status: RunStatus | 'all') => void;
}

const STATUS_LABELS: Record<RunStatus | 'all', string> = {
  all: 'Все',
  queued: 'В очереди',
  running: 'Выполняется',
  succeeded: 'Успешно',
  failed: 'Ошибка',
};

const STATUSES: (RunStatus | 'all')[] = ['all', 'queued', 'running', 'succeeded', 'failed'];

export const StatusFilter = ({ currentFilter, onFilterChange }: StatusFilterProps) => (
  <div className="status-filters" role="group" aria-label="Фильтр по статусу">
    {STATUSES.map((status) => (
      <button
        key={status}
        type="button"
        onClick={() => onFilterChange(status)}
        className={`filter-btn ${currentFilter === status ? 'active' : ''}`}
        aria-pressed={currentFilter === status}
      >
        {STATUS_LABELS[status]}
      </button>
    ))}
  </div>
);
