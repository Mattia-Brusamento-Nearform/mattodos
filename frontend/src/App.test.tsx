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
});
