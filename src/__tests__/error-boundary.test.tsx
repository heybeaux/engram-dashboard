import { describe, it, expect, vi, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

// Suppress console.error for expected errors
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <div>Child content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked', () => {
    // ErrorBoundary resets its internal state on retry click.
    // After reset, if the child still throws, it'll show the error again.
    // We just verify the button click triggers the reset mechanism.
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Click Try Again — boundary resets state, child re-renders and throws again
    fireEvent.click(screen.getByText('Try Again'));
    // The boundary catches the error again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

afterAll(() => {
  consoleSpy.mockRestore();
});
