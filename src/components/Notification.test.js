import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notification from './Notification';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }) => {
    // Use the icon's iconName property to identify which icon is being rendered
    return <span data-testid={`icon-${icon.iconName || 'unknown'}`} className={className} />;
  }
}));

// Mock the icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faTimes: { iconName: 'times' },
  faCheckCircle: { iconName: 'check-circle' },
  faInfoCircle: { iconName: 'info-circle' },
  faExclamationTriangle: { iconName: 'exclamation-triangle' }
}));

describe('Notification Component', () => {
  // Mock the timer functions
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('renders with the provided message', () => {
    render(
      <Notification 
        message="Test notification message" 
        type="error" 
        onClose={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Test notification message')).toBeInTheDocument();
  });
  
  test('applies the correct CSS class based on type', () => {
    const { container, rerender } = render(
      <Notification 
        message="Error notification" 
        type="error" 
        onClose={jest.fn()} 
      />
    );
    
    // Check error type
    expect(container.querySelector('.notification')).toHaveClass('error');
    
    // Check success type
    rerender(
      <Notification 
        message="Success notification" 
        type="success" 
        onClose={jest.fn()} 
      />
    );
    expect(container.querySelector('.notification')).toHaveClass('success');
    
    // Check info type
    rerender(
      <Notification 
        message="Info notification" 
        type="info" 
        onClose={jest.fn()} 
      />
    );
    expect(container.querySelector('.notification')).toHaveClass('info');
  });
  
  test('renders the correct icon based on type', () => {
    const { rerender } = render(
      <Notification 
        message="Error notification" 
        type="error" 
        onClose={jest.fn()} 
      />
    );
    
    // Check error icon
    expect(screen.getByTestId('icon-exclamation-triangle')).toBeInTheDocument();
    
    // Check success icon
    rerender(
      <Notification 
        message="Success notification" 
        type="success" 
        onClose={jest.fn()} 
      />
    );
    expect(screen.getByTestId('icon-check-circle')).toBeInTheDocument();
    
    // Check info icon
    rerender(
      <Notification 
        message="Info notification" 
        type="info" 
        onClose={jest.fn()} 
      />
    );
    expect(screen.getByTestId('icon-info-circle')).toBeInTheDocument();
    
    // Check default (error) icon when type is not recognized
    rerender(
      <Notification 
        message="Unknown type notification" 
        type="unknown" 
        onClose={jest.fn()} 
      />
    );
    expect(screen.getByTestId('icon-exclamation-triangle')).toBeInTheDocument();
  });
  
  test('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        type="error" 
        onClose={onCloseMock} 
      />
    );
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
  
  test('automatically calls onClose after the specified duration', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        type="error" 
        onClose={onCloseMock} 
        duration={2000} 
      />
    );
    
    // Timer should not have been called immediately
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Fast-forward time by 2000ms
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // onClose should have been called after the duration
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
  
  test('does not set up timer if duration is falsy', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        type="error" 
        onClose={onCloseMock} 
        duration={0} 
      />
    );
    
    // Fast-forward time by a large amount
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // onClose should not have been called
    expect(onCloseMock).not.toHaveBeenCalled();
  });
  
  test('clears the timer when unmounted', () => {
    const onCloseMock = jest.fn();
    const { unmount } = render(
      <Notification 
        message="Test notification" 
        type="error" 
        onClose={onCloseMock} 
        duration={2000} 
      />
    );
    
    // Unmount the component before the timer fires
    unmount();
    
    // Fast-forward time by 2000ms
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // onClose should not have been called because the component was unmounted
    expect(onCloseMock).not.toHaveBeenCalled();
  });
  
  test('uses default type "error" if not specified', () => {
    const { container } = render(
      <Notification 
        message="Test notification" 
        onClose={jest.fn()} 
      />
    );
    
    expect(container.querySelector('.notification')).toHaveClass('error');
    expect(screen.getByTestId('icon-exclamation-triangle')).toBeInTheDocument();
  });
  
  test('uses default duration of 5000ms if not specified', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        type="error" 
        onClose={onCloseMock} 
      />
    );
    
    // Fast-forward time by 4999ms
    act(() => {
      jest.advanceTimersByTime(4999);
    });
    
    // onClose should not have been called yet
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Fast-forward time by 1 more ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    // onClose should have been called after 5000ms
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
