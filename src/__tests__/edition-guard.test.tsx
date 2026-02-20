import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

// Mock the EDITION value — default is 'local'
vi.mock('@/types/instance', () => ({
  EDITION: 'local',
}));

import { EditionGuard } from '@/components/edition-guard';

describe('EditionGuard', () => {
  it('renders children when edition matches', () => {
    render(
      <EditionGuard edition="local">
        <div>Protected content</div>
      </EditionGuard>,
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('renders nothing when edition does not match', () => {
    const { container } = render(
      <EditionGuard edition="cloud">
        <div>Cloud only</div>
      </EditionGuard>,
    );
    expect(container.innerHTML).toBe('');
  });
});
