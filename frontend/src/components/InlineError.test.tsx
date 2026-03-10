import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InlineError } from './InlineError';

describe('InlineError', () => {
  it('renders error message', () => {
    const mockDismiss = vi.fn();
    render(<InlineError message="Something went wrong" onDismiss={mockDismiss} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    const mockDismiss = vi.fn();
    const { container } = render(<InlineError message="Error" onDismiss={mockDismiss} />);
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('auto-dismisses after 5 seconds', async () => {
    const mockDismiss = vi.fn();
    render(<InlineError message="Error" onDismiss={mockDismiss} />);

    await waitFor(
      () => {
        expect(mockDismiss).toHaveBeenCalled();
      },
      { timeout: 7000 },
    );
  }, 10000);
});
