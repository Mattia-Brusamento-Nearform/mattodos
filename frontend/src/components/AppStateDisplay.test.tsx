import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppStateDisplay } from './AppStateDisplay';
import type { AppState } from '../types/todo';

describe('AppStateDisplay', () => {
  it('renders loading skeleton when loading is true', () => {
    const state: AppState = {
      todos: [],
      loading: true,
      error: null,
    };
    const mockRetry = vi.fn();
    const { container } = render(
      <AppStateDisplay state={state} onRetry={mockRetry}>
        <div>Content</div>
      </AppStateDisplay>,
    );

    const skeletons = container.querySelectorAll('[aria-busy="true"] > div');
    expect(skeletons.length).toBe(3);
  });

  it('renders empty state when no todos', () => {
    const state: AppState = {
      todos: [],
      loading: false,
      error: null,
    };
    const mockRetry = vi.fn();
    render(
      <AppStateDisplay state={state} onRetry={mockRetry}>
        <div>Content</div>
      </AppStateDisplay>,
    );

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const state: AppState = {
      todos: [],
      loading: false,
      error: 'Unable to load your todos',
    };
    const mockRetry = vi.fn();
    render(
      <AppStateDisplay state={state} onRetry={mockRetry}>
        <div>Content</div>
      </AppStateDisplay>,
    );

    expect(screen.getByText('Unable to load your todos')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('has role="alert" on error state', () => {
    const state: AppState = {
      todos: [],
      loading: false,
      error: 'Error message',
    };
    const mockRetry = vi.fn();
    const { container } = render(
      <AppStateDisplay state={state} onRetry={mockRetry}>
        <div>Content</div>
      </AppStateDisplay>,
    );

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('renders children when todos exist', () => {
    const state: AppState = {
      todos: [
        {
          id: '1',
          description: 'Test',
          completed: false,
          createdAt: '2026-03-10T00:00:00Z',
          updatedAt: '2026-03-10T00:00:00Z',
        },
      ],
      loading: false,
      error: null,
    };
    const mockRetry = vi.fn();
    render(
      <AppStateDisplay state={state} onRetry={mockRetry}>
        <div>Content</div>
      </AppStateDisplay>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
