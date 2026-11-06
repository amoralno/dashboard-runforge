import type { Run } from '../types';
import { RunItem } from './RunItem';

interface RunListProps {
  runs: Run[];
  onSelectRun: (run: Run) => void;
  onResetFilters: () => void;
}

export const RunList = ({ runs, onSelectRun, onResetFilters }: RunListProps) => {
  if (runs.length === 0) {
    return (
      <div className="empty-state">
        <h3>Ничего не найдено</h3>
        <p>По вашему запросу не найдено ни одного запуска. Попробуйте изменить параметры поиска.</p>
        <button className="reset-btn" type="button" onClick={onResetFilters}>
          Сбросить фильтры
        </button>
      </div>
    );
  }

  return (
    <div className="run-list">
      {runs.map((run) => (
        <RunItem key={run.id} run={run} onClick={onSelectRun} />
      ))}
    </div>
  );
};
