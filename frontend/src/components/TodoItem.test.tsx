import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types/todo';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '123',
    description: 'Buy milk',
    completed: false,
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  };

  it('renders todo description', () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('renders creation timestamp', () => {
    render(<TodoItem todo={mockTodo} />);
    const timeElement = screen.getByRole('time');
    expect(timeElement).toBeInTheDocument();
  });

  it('shows optimistic styling when optimistic is true', () => {
    const optimisticTodo = { ...mockTodo, optimistic: true };
    const { container } = render(<TodoItem todo={optimisticTodo} />);
    const li = container.querySelector('li');
    expect(li).toHaveClass('opacity-70');
  });

  it('does not show optimistic styling when optimistic is false', () => {
    const { container } = render(<TodoItem todo={mockTodo} />);
    const li = container.querySelector('li');
    expect(li).not.toHaveClass('opacity-70');
  });
});
