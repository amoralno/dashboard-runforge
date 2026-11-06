import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Run, RunStatus } from './types';
import { fetchRuns } from './services/mockApi';

import { RunList } from './components/RunList';
import { SearchBar } from './components/SearchBar';
import { StatusFilter } from './components/StatusFilter';
import { SortSelector, type SortOption } from './components/SortSelector';
import { RunDetails } from './components/RunDetails';

const VALID_STATUSES: (RunStatus | 'all')[] = ['all', 'queued', 'running', 'succeeded', 'failed'];
const VALID_SORTS: SortOption[] = ['date_desc', 'date_asc', 'duration_desc', 'duration_asc'];

function App() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const rawStatus = searchParams.get('status');
  const statusFilter: RunStatus | 'all' = VALID_STATUSES.includes(rawStatus as RunStatus | 'all')
    ? (rawStatus as RunStatus | 'all')
    : 'all';

  const rawSort = searchParams.get('sort');
  const sortBy: SortOption = VALID_SORTS.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'date_desc';

  const searchQuery = searchParams.get('search') ?? '';

  const setSearchQuery = (value: string) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (value.trim()) nextParams.set('search', value);
      else nextParams.delete('search');
      return nextParams;
    }, { replace: true });
  };

  const setStatusFilter = (value: RunStatus | 'all') => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (value !== 'all') nextParams.set('status', value);
      else nextParams.delete('status');
      return nextParams;
    });
  };

  const setSortBy = (value: SortOption) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      nextParams.set('sort', value);
      return nextParams;
    });
  };

  const handleResetFilters = () => setSearchParams({});
  const handleCloseDetails = useCallback(() => setSelectedRun(null), []);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchRuns();
      setRuns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    void loadData();
  };

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const processedRuns = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ru-RU');

    const filteredRuns = runs.filter((run) => {
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      const matchesSearch =
        run.name.toLocaleLowerCase('ru-RU').includes(normalizedQuery) ||
        run.repository.toLocaleLowerCase('ru-RU').includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });

    return filteredRuns.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'duration_desc':
        case 'duration_asc': {
          const aDuration = a.durationSeconds;
          const bDuration = b.durationSeconds;

          if (aDuration == null && bDuration == null) return 0;
          if (aDuration == null) return 1;
          if (bDuration == null) return -1;

          return sortBy === 'duration_asc'
            ? aDuration - bDuration
            : bDuration - aDuration;
        }
        default:
          return 0;
      }
    });
  }, [runs, statusFilter, searchQuery, sortBy]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Runforge</h1>
        <span className="project-name">Dashboard / web-platform</span>
      </header>

      <main className="app-main">
        <div className="page-title">
          <h2>Последние запуски</h2>
        </div>

        {isLoading && (
          <div className="skeleton-list" aria-label="Загрузка запусков" aria-busy="true">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-item" aria-hidden="true">
                <div className="skeleton-info">
                  <div className="skeleton-title" />
                  <div className="skeleton-subtitle" />
                </div>
                <div className="skeleton-meta">
                  <div className="skeleton-badge" />
                  <div className="skeleton-date" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="state-message error-state" role="alert">
            <h3>Упс! Что-то пошло не так 😢</h3>
            <p>{error}</p>
            <button className="retry-btn" type="button" onClick={handleRetry}>
              Повторить запрос
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="controls-panel">
              <div className="controls-top">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <SortSelector value={sortBy} onChange={setSortBy} />
              </div>
              <StatusFilter currentFilter={statusFilter} onFilterChange={setStatusFilter} />
            </div>

            <RunList
              runs={processedRuns}
              onSelectRun={setSelectedRun}
              onResetFilters={handleResetFilters}
            />
          </>
        )}
      </main>

      <RunDetails run={selectedRun} onClose={handleCloseDetails} />
    </div>
  );
}

export default App;
