import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TodoFooter } from './TodoFooter';

describe('TodoFooter', () => {
  it('renders remaining count', () => {
    render(<TodoFooter remaining={10} total={15} />);
    expect(screen.getByText('10 remaining')).toBeInTheDocument();
  });

  it('renders total count', () => {
    render(<TodoFooter remaining={10} total={15} />);
    expect(screen.getByText('15 total')).toBeInTheDocument();
  });

  it('has aria-live="polite" attribute', () => {
    const { container } = render(<TodoFooter remaining={10} total={15} />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveAttribute('aria-live', 'polite');
  });

  it('displays correct counts for zero remaining', () => {
    render(<TodoFooter remaining={0} total={5} />);
    expect(screen.getByText('0 remaining')).toBeInTheDocument();
    expect(screen.getByText('5 total')).toBeInTheDocument();
  });

  it('displays correct counts at limit', () => {
    render(<TodoFooter remaining={0} total={50} />);
    expect(screen.getByText('0 remaining')).toBeInTheDocument();
    expect(screen.getByText('50 total')).toBeInTheDocument();
  });
});
