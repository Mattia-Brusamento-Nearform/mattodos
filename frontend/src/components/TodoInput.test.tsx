import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  it('renders with placeholder', () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });

  it('submits on Enter with non-empty input', async () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSubmit).toHaveBeenCalledWith('Buy milk');
  });

  it('clears input after submit', async () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Test todo' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('ignores empty input on Enter', () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('ignores whitespace-only input on Enter', () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('auto-focuses on mount', () => {
    const mockSubmit = vi.fn();
    render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    expect(document.activeElement).toBe(input);
  });

  it('restores text when restoredText prop changes', async () => {
    const mockSubmit = vi.fn();
    const { rerender } = render(<TodoInput onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("What's on your mind?") as HTMLInputElement;

    rerender(<TodoInput onSubmit={mockSubmit} restoredText="Failed todo" />);

    await waitFor(() => {
      expect(input.value).toBe('Failed todo');
    });
  });
});
