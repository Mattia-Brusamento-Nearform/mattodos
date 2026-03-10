import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders checkbox reflecting todo.completed state - unchecked', () => {
    render(<TodoItem todo={mockTodo} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checkbox reflecting todo.completed state - checked', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('applies line-through and opacity-40 when completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} />);
    const description = screen.getByText('Buy milk');
    expect(description).toHaveClass('line-through', 'opacity-40');
  });

  it('does not apply completed styling when not completed', () => {
    render(<TodoItem todo={mockTodo} />);
    const description = screen.getByText('Buy milk');
    expect(description).not.toHaveClass('line-through');
    expect(description).not.toHaveClass('opacity-40');
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={mockTodo} onToggle={onToggle} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(onToggle).toHaveBeenCalledWith('123');
  });

  it('renders delete button with correct aria-label', () => {
    render(<TodoItem todo={mockTodo} />);
    const deleteButton = screen.getByRole('button', {
      name: /delete 'buy milk'/i,
    });
    expect(deleteButton).toBeInTheDocument();
  });

  it('opens confirm dialog when delete button clicked', () => {
    render(<TodoItem todo={mockTodo} />);
    const deleteButton = screen.getByRole('button', {
      name: /delete 'buy milk'/i,
    });
    fireEvent.click(deleteButton);
    
    // Dialog should appear with title
    expect(screen.getByText("Delete 'Buy milk'?")).toBeInTheDocument();
  });

  it('calls onDelete when confirm dialog Delete is clicked', () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={mockTodo} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', {
      name: /delete 'buy milk'/i,
    });
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByText('Delete', { selector: 'button' });
    fireEvent.click(confirmButton);
    
    expect(onDelete).toHaveBeenCalledWith('123');
  });

  it('closes dialog when cancel is clicked', () => {
    render(<TodoItem todo={mockTodo} />);
    
    const deleteButton = screen.getByRole('button', {
      name: /delete 'buy milk'/i,
    });
    fireEvent.click(deleteButton);
    expect(screen.getByText("Delete 'Buy milk'?")).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Dialog should be gone
    expect(screen.queryByText("Delete 'Buy milk'?")).not.toBeInTheDocument();
  });
});
