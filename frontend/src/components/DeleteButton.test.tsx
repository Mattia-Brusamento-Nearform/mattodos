import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteButton } from './DeleteButton';

describe('DeleteButton', () => {
  it('renders × icon', () => {
    const { container } = render(
      <DeleteButton onDelete={() => {}} todoDescription="Buy milk" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(
      <DeleteButton onDelete={() => {}} todoDescription="Buy milk" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', "Delete 'Buy milk'");
  });

  it('calls onDelete when clicked', () => {
    const onDelete = vi.fn();
    render(
      <DeleteButton onDelete={onDelete} todoDescription="Buy milk" />
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('is visible on focus-visible', () => {
    render(
      <DeleteButton onDelete={() => {}} todoDescription="Buy milk" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:opacity-100');
  });

  it('has focus ring on keyboard focus', () => {
    render(
      <DeleteButton onDelete={() => {}} todoDescription="Buy milk" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus-visible:ring-2');
  });
});
