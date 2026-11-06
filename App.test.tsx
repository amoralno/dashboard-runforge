import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Run } from './types';
import App from './App';
import { fetchRuns } from './services/mockApi';

vi.mock('./services/mockApi', () => ({
  fetchRuns: vi.fn(),
}));

const mockRuns: Run[] = [
  {
    id: '1',
    name: 'Test Run 1',
    repository: 'repo-one',
    branch: 'main',
    status: 'succeeded',
    createdAt: '2026-11-06T10:00:00.000Z',
    durationSeconds: 45,
    logs: ['Build started', 'Build completed'],
    result: 'OK',
  },
  {
    id: '2',
    name: 'Test Run 2',
    repository: 'repo-two',
    branch: 'dev',
    status: 'failed',
    createdAt: '2026-11-06T11:00:00.000Z',
    durationSeconds: 90,
    logs: ['Tests started', 'Test suite failed'],
    result: 'Error',
  },
  {
    id: '3',
    name: 'Run without duration',
    repository: 'repo-three',
    branch: 'feature/no-duration',
    status: 'queued',
    createdAt: '2026-11-06T12:00:00.000Z',
    logs: ['Waiting for runner'],
  },
];

const renderApp = (initialEntry = '/') => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <App />
  </MemoryRouter>,
);

beforeEach(() => {
  vi.mocked(fetchRuns).mockReset();
});

describe('App', () => {
  it('фильтрует запуски по статусу', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp();

    expect(await screen.findByText('Test Run 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ошибка' }));

    expect(screen.queryByText('Test Run 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ошибка' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ищет запуски по названию и репозиторию', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp();

    await screen.findByText('Test Run 1');
    const searchInput = screen.getByRole('searchbox', {
      name: 'Поиск по названию запуска или репозиторию',
    });

    await user.clear(searchInput);
    await user.type(searchInput, 'repo-two');

    expect(screen.queryByText('Test Run 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
  });

  it('применяет поиск и фильтр одновременно', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp();

    await screen.findByText('Test Run 1');
    await user.type(
      screen.getByRole('searchbox', { name: 'Поиск по названию запуска или репозиторию' }),
      'repo-two',
    );
    await user.click(screen.getByRole('button', { name: 'Ошибка' }));

    expect(screen.getByText('Test Run 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Run 1')).not.toBeInTheDocument();
  });

  it('показывает пустое состояние и позволяет сбросить параметры', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp();

    await screen.findByText('Test Run 1');
    await user.type(
      screen.getByRole('searchbox', { name: 'Поиск по названию запуска или репозиторию' }),
      'nothing-found',
    );

    expect(screen.getByRole('heading', { name: 'Ничего не найдено' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(screen.getByText('Test Run 1')).toBeInTheDocument();
  });

  it('показывает ошибку загрузки и повторяет запрос', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns)
      .mockRejectedValueOnce(new Error('Сетевая ошибка'))
      .mockResolvedValueOnce(mockRuns);
    renderApp();

    expect(await screen.findByRole('alert')).toHaveTextContent('Сетевая ошибка');
    await user.click(screen.getByRole('button', { name: 'Повторить запрос' }));

    expect(await screen.findByText('Test Run 1')).toBeInTheDocument();
    expect(fetchRuns).toHaveBeenCalledTimes(2);
  });

  it('открывает детали запуска, удерживает фокус и возвращает его после закрытия', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp();

    const runButton = await screen.findByRole('button', {
      name: 'Открыть детали запуска Test Run 1',
    });
    await user.click(runButton);

    expect(screen.getByRole('dialog', { name: 'Test Run 1' })).toBeInTheDocument();
    expect(screen.getByText(/Build started/)).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Закрыть окно' });
    expect(closeButton).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(runButton).toHaveFocus());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('оставляет запуски без длительности в конце при сортировке по длительности', async () => {
    vi.mocked(fetchRuns).mockResolvedValue(mockRuns);
    renderApp('/?sort=duration_asc');

    await screen.findByText('Test Run 1');
    const runNames = screen
      .getAllByRole('button', { name: /^Открыть детали запуска/ })
      .map((button) => button.getAttribute('aria-label'));

    expect(runNames[0]).toBe('Открыть детали запуска Test Run 1');
    expect(runNames[1]).toBe('Открыть детали запуска Test Run 2');
    expect(runNames[2]).toBe('Открыть детали запуска Run without duration');
  });
});
