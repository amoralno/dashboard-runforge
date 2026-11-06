import type { Run } from '../types';

const MOCK_RUNS: Run[] = [
  {
    id: '1',
    name: 'Auth refactor',
    repository: 'web-platform',
    branch: 'feature/auth-v2',
    status: 'running',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    durationSeconds: 320,
    logs: ['Starting build...', 'Installing dependencies...', 'Compiling TypeScript...'],
  },
  {
    id: '2',
    name: 'Fix checkout tests',
    repository: 'payments',
    branch: 'bugfix/checkout-500',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    durationSeconds: 125,
    logs: ['Running tests...', 'All 42 tests passed.', 'Build successful.'],
    result: 'PR #123 merged successfully.',
  },
  {
    id: '3',
    name: 'Update dependencies',
    repository: 'api-service',
    branch: 'chore/deps-update',
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    logs: ['Waiting for available runner...'],
  },
  {
    id: '4',
    name: 'Deploy to staging',
    repository: 'web-platform',
    branch: 'main',
    status: 'failed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    durationSeconds: 45,
    logs: ['Starting deploy...', 'Error: Connection timeout.', 'Deploy aborted.'],
    result: 'Error: Connection timeout at deploy step.',
  },
  {
    id: '5',
    name: 'Migrate DB schema',
    repository: 'database-migrations',
    branch: 'feat/new-users-table',
    status: 'running',
    createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
    logs: ['Connecting to DB...', 'Applying migration 001...'],
  },
  {
    id: '6',
    name: 'Lint frontend code',
    repository: 'web-platform',
    branch: 'fix/lint-errors',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    durationSeconds: 12,
    logs: ['Running ESLint...', 'No errors found.'],
  },
];

export const fetchRuns = async (): Promise<Run[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_RUNS), 1500);
  });
};
