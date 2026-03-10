import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the api module
vi.mock('./services/api', () => ({
  api: {
    getTodos: vi.fn(() => Promise.resolve([])),
    createTodo: vi.fn(() =>
      Promise.resolve({
        id: '123',
        description: 'Test todo',
        completed: false,
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
      }),
    ),
    toggleTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

// Helper function to create mock todos
function createMockTodos(count: number, completedCount: number = 0) {
  const todos = [];
  for (let i = 0; i < count; i++) {
    todos.push({
      id: `todo-${i}`,
      description: `Todo ${i + 1}`,
      completed: i < completedCount,
      createdAt: '2026-03-10T00:00:00Z',
      updatedAt: '2026-03-10T00:00:00Z',
    });
  }
  return todos;
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and subtitle', async () => {
    render(<App />);
    expect(screen.getByText('mattodos')).toBeInTheDocument();
    expect(screen.getByText('Your tasks, your pace.')).toBeInTheDocument();
  });

  it('shows loading state on mount', () => {
    const { container } = render(<App />);
    const busy = container.querySelector('[aria-busy="true"]');
    expect(busy).toBeInTheDocument();
  });

  it('shows empty state when no todos', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('No todos yet')).toBeInTheDocument();
    });
  });

  it('has input field visible', () => {
    render(<App />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('input is enabled when fewer than 50 todos', async () => {
    const { api } = await import('./services/api');
    vi.mocked(api.getTodos).mockResolvedValue(createMockTodos(30));

    render(<App />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;
      expect(input).not.toBeDisabled();
    });
  });

  it('input is disabled when 50 todos exist', async () => {
    const { api } = await import('./services/api');
    vi.mocked(api.getTodos).mockResolvedValue(createMockTodos(50));

    render(<App />);
    await waitFor(() => {
      const input = screen.getByPlaceholderText("Todo limit reached") as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  it('shows limit message when at capacity', async () => {
    const { api } = await import('./services/api');
    vi.mocked(api.getTodos).mockResolvedValue(createMockTodos(50));

    render(<App />);
    await waitFor(() => {
      expect(
        screen.getByText('Todo limit reached. Complete or delete some to add more.'),
      ).toBeInTheDocument();
    });
  });

  it('hides limit message when under limit', async () => {
    const { api } = await import('./services/api');
    vi.mocked(api.getTodos).mockResolvedValue(createMockTodos(30));

    render(<App />);
    await waitFor(() => {
      expect(
        screen.queryByText('Todo limit reached. Complete or delete some to add more.'),
      ).not.toBeInTheDocument();
    });
  });

  it('displays footer with correct remaining and total counts', async () => {
    const { api } = await import('./services/api');
    vi.mocked(api.getTodos).mockResolvedValue(createMockTodos(10, 3)); // 10 total, 3 completed, 7 remaining

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('7 remaining')).toBeInTheDocument();
      expect(screen.getByText('10 total')).toBeInTheDocument();
    });
  });

  it('footer hidden when no todos', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
      expect(screen.queryByText(/total/)).not.toBeInTheDocument();
    });
  });
});
