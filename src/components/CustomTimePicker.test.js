import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomTimePicker from './CustomTimePicker';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: function MockFontAwesomeIcon(props) {
    // Extract the icon name from the icon object
    let iconName = '';
    if (props.icon && props.icon.iconName) {
      iconName = props.icon.iconName;
    }
    return <span data-testid={`icon-${iconName}`} className={props.className} />;
  }
}));

describe('CustomTimePicker Component', () => {
  const defaultProps = {
    value: '09:00',
    onChange: jest.fn(),
    disabled: false,
    label: 'Start Time',
    isStart: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with the provided label', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
  });

  test('renders with the provided time value', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    expect(screen.getByText('09:00')).toBeInTheDocument();
  });

  test('renders "Select time" when no value is provided', () => {
    render(<CustomTimePicker {...defaultProps} value="" />);
    
    expect(screen.getByText('Select time')).toBeInTheDocument();
  });

  test('renders dropdown icon', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();
  });

  test('applies start-time class when isStart is true', () => {
    const { container } = render(<CustomTimePicker {...defaultProps} isStart={true} />);
    
    expect(container.querySelector('.start-time')).toBeInTheDocument();
    expect(container.querySelector('.end-time')).not.toBeInTheDocument();
  });

  test('applies end-time class when isStart is false', () => {
    const { container } = render(<CustomTimePicker {...defaultProps} isStart={false} />);
    
    expect(container.querySelector('.end-time')).toBeInTheDocument();
    expect(container.querySelector('.start-time')).not.toBeInTheDocument();
  });

  test('applies disabled class when disabled is true', () => {
    const { container } = render(<CustomTimePicker {...defaultProps} disabled={true} />);
    
    expect(container.querySelector('.time-input.disabled')).toBeInTheDocument();
  });

  test('does not show dropdown when disabled', () => {
    render(<CustomTimePicker {...defaultProps} disabled={true} />);
    
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    expect(screen.queryByText('Hour')).not.toBeInTheDocument();
    expect(screen.queryByText('Minute')).not.toBeInTheDocument();
  });

  test('shows dropdown when clicked', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Minute')).toBeInTheDocument();
  });

  test('changes icon when dropdown is opened', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    // Initially shows down icon
    expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();
    
    // Click to open dropdown
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    // Now shows up icon
    expect(screen.getByTestId('icon-chevron-up')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-chevron-down')).not.toBeInTheDocument();
  });

  test('shows hour selection by default when opened', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    expect(screen.getByText('Hour').closest('button')).toHaveClass('active');
    expect(screen.getByText('Minute').closest('button')).not.toHaveClass('active');
    
    // Check that hour grid is shown
    const hourButtons = screen.getAllByRole('button').filter(button => 
      button.textContent.match(/^[0-9]{2}$/) && parseInt(button.textContent) < 24
    );
    expect(hourButtons.length).toBe(24); // 24 hour buttons (0-23)
  });

  test('switches to minute selection when hour tab is clicked', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    // Open dropdown
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    // Click minute tab
    const minuteTab = screen.getByText('Minute');
    fireEvent.click(minuteTab);
    
    expect(screen.getByText('Minute').closest('button')).toHaveClass('active');
    expect(screen.getByText('Hour').closest('button')).not.toHaveClass('active');
    
    // Check that minute grid is shown
    const minuteButtons = screen.getAllByRole('button').filter(button => 
      button.textContent === '00' || 
      button.textContent === '15' || 
      button.textContent === '30' || 
      button.textContent === '45'
    );
    expect(minuteButtons.length).toBe(4); // 4 minute options (0, 15, 30, 45)
  });

  test('selects hour when hour button is clicked', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    // Open dropdown
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    // Click hour 14
    const hourButton = screen.getByText('14');
    fireEvent.click(hourButton);
    
    // Should call onChange with new time (14:00)
    expect(defaultProps.onChange).toHaveBeenCalledWith('14:00');
    
    // Should switch to minute selection
    expect(screen.getByText('Minute').closest('button')).toHaveClass('active');
  });

  test('selects minute and closes dropdown when minute button is clicked', () => {
    render(<CustomTimePicker {...defaultProps} />);
    
    // Open dropdown
    const timeInput = screen.getByText('09:00');
    fireEvent.click(timeInput);
    
    // Switch to minute selection
    const minuteTab = screen.getByText('Minute');
    fireEvent.click(minuteTab);
    
    // Click minute 30
    const minuteButton = screen.getByText('30');
    fireEvent.click(minuteButton);
    
    // Should call onChange with new time (09:30)
    expect(defaultProps.onChange).toHaveBeenCalledWith('09:30');
    
    // Dropdown should be closed
    expect(screen.queryByText('Hour')).not.toBeInTheDocument();
    expect(screen.queryByText('Minute')).not.toBeInTheDocument();
  });

  test('highlights the currently selected hour', () => {
    render(<CustomTimePicker {...defaultProps} value="14:00" />);
    
    // Open dropdown
    const timeInput = screen.getByText('14:00');
    fireEvent.click(timeInput);
    
    // Find the hour button for 14
    const hourButton = screen.getByText('14');
    
    // Check that it has the selected class
    expect(hourButton).toHaveClass('selected');
  });

  test('highlights the currently selected minute', () => {
    render(<CustomTimePicker {...defaultProps} value="09:30" />);
    
    // Open dropdown
    const timeInput = screen.getByText('09:30');
    fireEvent.click(timeInput);
    
    // Switch to minute selection
    const minuteTab = screen.getByText('Minute');
    fireEvent.click(minuteTab);
    
    // Find the minute button for 30
    const minuteButton = screen.getByText('30');
    
    // Check that it has the selected class
    expect(minuteButton).toHaveClass('selected');
  });

  test('uses default time of 9:00 when no value is provided', () => {
    render(<CustomTimePicker {...defaultProps} value="" />);
    
    // Open dropdown
    const timeInput = screen.getByText('Select time');
    fireEvent.click(timeInput);
    
    // Find the hour button for 9
    const hourButton = screen.getByText('09');
    
    // Check that it has the selected class
    expect(hourButton).toHaveClass('selected');
  });
});
