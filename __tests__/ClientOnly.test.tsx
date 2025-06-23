import React from 'react';
import { render, screen } from '@testing-library/react';
import ClientOnly from '../src/components/ClientOnly';

// Mock React's useState to control the mounted state
const originalUseState = React.useState;

describe('ClientOnly', () => {
  afterEach(() => {
    // Restore original useState
    React.useState = originalUseState;
  });

  it('should render fallback when not mounted', () => {
    // Mock useState to return false for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([false, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    render(
      <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="content">Client content</div>
      </ClientOnly>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('should render children when mounted', () => {
    // Mock useState to return true for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([true, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    render(
      <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="content">Client content</div>
      </ClientOnly>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('should render null fallback by default when not mounted', () => {
    // Mock useState to return false for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([false, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    const { container } = render(
      <ClientOnly>
        <div data-testid="content">Client content</div>
      </ClientOnly>
    );

    // Initially renders nothing (null fallback)
    expect(container.firstChild).toBe(null);
  });

  it('should render children when mounted with no fallback', () => {
    // Mock useState to return true for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([true, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    render(
      <ClientOnly>
        <div data-testid="content">Client content</div>
      </ClientOnly>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should handle multiple children when mounted', () => {
    // Mock useState to return true for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([true, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    render(
      <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
        <div data-testid="content1">First child</div>
        <div data-testid="content2">Second child</div>
      </ClientOnly>
    );

    expect(screen.getByTestId('content1')).toBeInTheDocument();
    expect(screen.getByTestId('content2')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('should handle complex fallback component when not mounted', () => {
    // Mock useState to return false for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([false, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    render(
      <ClientOnly
        fallback={
          <div data-testid="complex-fallback">
            <h1>Loading...</h1>
            <p>Please wait while we load the content</p>
          </div>
        }
      >
        <div data-testid="content">Client content</div>
      </ClientOnly>
    );

    expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we load the content')).toBeInTheDocument();
  });

  it('should handle nested components as children when mounted', () => {
    // Mock useState to return true for hasMounted
    React.useState = jest.fn()
      .mockReturnValueOnce([true, jest.fn()]) // hasMounted state
      .mockImplementation(originalUseState); // Other useState calls

    const NestedComponent = () => (
      <div data-testid="nested">
        <span>Nested content</span>
      </div>
    );

    render(
      <ClientOnly>
        <NestedComponent />
      </ClientOnly>
    );

    expect(screen.getByTestId('nested')).toBeInTheDocument();
    expect(screen.getByText('Nested content')).toBeInTheDocument();
  });
});
