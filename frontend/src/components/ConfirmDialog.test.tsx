import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete 'Buy milk'?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title text when open', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete 'Buy milk'?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText("Delete 'Buy milk'?")).toBeInTheDocument();
  });

  it('shows Cancel and Delete buttons', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={onCancel}
        onConfirm={() => {}}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={() => {}}
        onConfirm={onConfirm}
      />
    );
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={onCancel}
        onConfirm={() => {}}
      />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={onCancel}
        onConfirm={() => {}}
      />
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onCancel).toHaveBeenCalledTimes(1);
    }
  });

  it('has role dialog and aria-modal', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('initial focus is on Cancel button', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveFocus();
  });
});
