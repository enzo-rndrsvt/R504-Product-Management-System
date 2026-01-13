import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('div > div');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct styles', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerWrapper = container.firstChild;
    expect(spinnerWrapper).toHaveClass('flex', 'justify-center', 'items-center');
  });
});
