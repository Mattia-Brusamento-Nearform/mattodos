import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoCheckbox } from './TodoCheckbox';

describe('TodoCheckbox', () => {
  it('renders unchecked circle when checked=false', () => {
    const { container } = render(
      <TodoCheckbox checked={false} onToggle={() => {}} label="Buy milk" />
    );
    const button = screen.getByRole('checkbox');
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(button).toHaveClass('border-stone-300');
  });

  it('renders green filled circle with checkmark when checked=true', () => {
    const { container } = render(
      <TodoCheckbox checked={true} onToggle={() => {}} label="Buy milk" />
    );
    const button = screen.getByRole('checkbox');
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveClass('bg-green-600');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(
      <TodoCheckbox checked={false} onToggle={onToggle} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    fireEvent.click(button);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label for complete state', () => {
    render(
      <TodoCheckbox checked={false} onToggle={() => {}} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    expect(button).toHaveAttribute('aria-label', 'Mark "Buy milk" as complete');
  });

  it('has correct aria-label for incomplete state', () => {
    render(
      <TodoCheckbox checked={true} onToggle={() => {}} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    expect(button).toHaveAttribute('aria-label', 'Mark "Buy milk" as incomplete');
  });

  it('shows focus ring on keyboard focus', () => {
    render(
      <TodoCheckbox checked={false} onToggle={() => {}} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    button.focus();
    
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus-visible:ring-2');
  });

  it('calls onToggle when Space key is pressed', () => {
    const onToggle = vi.fn();
    render(
      <TodoCheckbox checked={false} onToggle={onToggle} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle when Enter key is pressed', () => {
    const onToggle = vi.fn();
    render(
      <TodoCheckbox checked={false} onToggle={onToggle} label="Buy milk" />
    );
    
    const button = screen.getByRole('checkbox');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
