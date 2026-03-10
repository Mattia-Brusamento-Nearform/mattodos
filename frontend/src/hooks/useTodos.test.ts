import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from './useTodos';
import * as apiModule from '../services/api';

vi.mock('../services/api');

describe('useTodos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.todos).toEqual([]);
    expect(result.current.state.error).toBeNull();
  });

  it('loads todos successfully', async () => {
    const mockTodos = [
      {
        id: '1',
        description: 'Test',
        completed: false,
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
      },
    ];
    vi.mocked(apiModule.api.getTodos).mockResolvedValue(mockTodos);

    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.loadTodos();
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.todos).toEqual(mockTodos);
    });
  });

  it('handles load failure', async () => {
    vi.mocked(apiModule.api.getTodos).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.loadTodos();
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBe('Unable to load your todos');
    });
  });

  it('creates todo successfully', async () => {
    const newTodo = {
      id: '123',
      description: 'Buy milk',
      completed: false,
      createdAt: '2026-03-10T00:00:00Z',
      updatedAt: '2026-03-10T00:00:00Z',
    };
    vi.mocked(apiModule.api.createTodo).mockResolvedValue(newTodo);

    const { result } = renderHook(() => useTodos());

    let returnValue: string | null = null;
    await act(async () => {
      returnValue = await result.current.createTodo('Buy milk');
    });

    expect(returnValue).toBeNull();
    await waitFor(() => {
      expect(result.current.state.todos).toContainEqual(newTodo);
    });
  });

  it('returns original text on create failure', async () => {
    vi.mocked(apiModule.api.createTodo).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useTodos());

    let returnValue: string | null = null;
    await act(async () => {
      returnValue = await result.current.createTodo('Buy milk');
    });

    expect(returnValue).toBe('Buy milk');
  });
});
