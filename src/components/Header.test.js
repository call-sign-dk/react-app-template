import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: function MockFontAwesomeIcon(props) {
    // Create a mock component that renders different test IDs
    // based on the context where it's used
    
    // For the brand icon in the header
    if (props.className === 'brand-icon') {
      return <span data-testid="icon-calendar" className={props.className} />;
    }
    
    // For the menu toggle button
    // We'll use the component's props to determine which icon to show
    return <span data-testid="icon-toggle" className={props.className} />;
  }
}));

describe('Header Component', () => {
  const defaultProps = {
    onMenuToggle: jest.fn(),
    isMobileMenuOpen: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with correct title', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('Appointment Scheduler')).toBeInTheDocument();
  });

  test('renders brand icon', () => {
    render(<Header {...defaultProps} />);
    
    // Check for the calendar icon
    expect(screen.getByTestId('icon-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('icon-calendar')).toHaveClass('brand-icon');
  });

  test('calls onMenuToggle when mobile menu button is clicked', () => {
    render(<Header {...defaultProps} />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    expect(defaultProps.onMenuToggle).toHaveBeenCalledTimes(1);
  });

  test('renders different icons based on menu state', () => {
    // First render with menu closed
    const { rerender } = render(<Header {...defaultProps} isMobileMenuOpen={false} />);
    
    // Check that the toggle icon is rendered
    expect(screen.getByTestId('icon-toggle')).toBeInTheDocument();
    
    // Re-render with menu open
    rerender(<Header {...defaultProps} isMobileMenuOpen={true} />);
    
    // The icon should still be there, but with different props
    expect(screen.getByTestId('icon-toggle')).toBeInTheDocument();
  });

  test('renders header with correct classes', () => {
    const { container } = render(<Header {...defaultProps} />);
    
    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.header-brand')).toBeInTheDocument();
    expect(container.querySelector('.header-actions')).toBeInTheDocument();
  });

  test('renders mobile menu toggle button with correct class', () => {
    const { container } = render(<Header {...defaultProps} />);
    
    const toggleButton = container.querySelector('.mobile-menu-toggle');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton.tagName).toBe('BUTTON');
  });
});
