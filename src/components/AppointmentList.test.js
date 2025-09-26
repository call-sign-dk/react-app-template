import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentList from './AppointmentList';

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

describe('AppointmentList Component', () => {
  // Sample date and appointments data
  const selectedDate = new Date('2023-05-15');
  const dateKey = '2023-05-15';
  
  const sampleAppointments = {
    [dateKey]: [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        from: '10:00',
        to: '11:00',
        priority: 'high',
        date: dateKey
      },
      {
        id: '2',
        title: 'Lunch Break',
        from: '12:30',
        to: '13:30',
        priority: 'medium',
        date: dateKey
      },
      {
        id: '3',
        title: 'Client Call',
        description: 'Discuss project timeline',
        from: '09:00',
        to: '10:00',
        priority: 'low',
        date: dateKey
      }
    ]
  };
  
  const defaultProps = {
    appointments: sampleAppointments,
    selectedDate: selectedDate,
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders no appointments message when there are no appointments', () => {
    // Empty appointments object
    const emptyAppointments = {};
    
    render(
      <AppointmentList 
        {...defaultProps}
        appointments={emptyAppointments}
      />
    );
    
    expect(screen.getByText('No appointments for today')).toBeInTheDocument();
  });

  test('renders appointments sorted by time', () => {
    render(<AppointmentList {...defaultProps} />);
    
    // Get all appointment times
    const appointmentTimes = screen.getAllByText(/\d{1,2}:\d{2} - \d{1,2}:\d{2}/);
    
    // Check that they are in the correct order (sorted by 'from' time)
    expect(appointmentTimes[0]).toHaveTextContent('09:00 - 10:00');
    expect(appointmentTimes[1]).toHaveTextContent('10:00 - 11:00');
    expect(appointmentTimes[2]).toHaveTextContent('12:30 - 13:30');
  });

  test('renders appointment titles correctly', () => {
    render(<AppointmentList {...defaultProps} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    expect(screen.getByText('Client Call')).toBeInTheDocument();
  });

  test('renders appointment descriptions when available', () => {
    render(<AppointmentList {...defaultProps} />);
    
    expect(screen.getByText('Weekly team sync')).toBeInTheDocument();
    expect(screen.getByText('Discuss project timeline')).toBeInTheDocument();
  });

  test('applies priority class to appointment items', () => {
    const { container } = render(<AppointmentList {...defaultProps} />);
    
    const appointmentItems = container.querySelectorAll('.appointment-item');
    
    // Check that the priority classes are applied correctly
    // Note: The appointments are sorted by time, so the order is different from the input
    expect(appointmentItems[0]).toHaveClass('low'); // Client Call (09:00)
    expect(appointmentItems[1]).toHaveClass('high'); // Team Meeting (10:00)
    expect(appointmentItems[2]).toHaveClass('medium'); // Lunch Break (12:30)
  });

  test('calls onEdit with the appointment when edit button is clicked', () => {
    render(<AppointmentList {...defaultProps} />);
    
    // Get all edit buttons
    const editButtons = screen.getAllByTitle('Edit appointment');
    
    // Click the first edit button (Client Call)
    fireEvent.click(editButtons[0]);
    
    // Check that onEdit was called with the correct appointment
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(sampleAppointments[dateKey][2]); // Client Call is now first due to sorting
  });

  test('calls onDelete with appointment id and date when delete button is clicked', () => {
    render(<AppointmentList {...defaultProps} />);
    
    // Get all delete buttons
    const deleteButtons = screen.getAllByTitle('Delete appointment');
    
    // Click the second delete button (Team Meeting)
    fireEvent.click(deleteButtons[1]);
    
    // Check that onDelete was called with the correct appointment id and date
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(
      sampleAppointments[dateKey][0].id, // Team Meeting is now second due to sorting
      sampleAppointments[dateKey][0].date
    );
  });

  test('renders clock icon for appointment times', () => {
    render(<AppointmentList {...defaultProps} />);
    
    // Check that the clock icons are rendered
    const clockIcons = screen.getAllByTestId('icon-clock');
    expect(clockIcons).toHaveLength(3); // One for each appointment
  });

  test('renders edit and delete icons for each appointment', () => {
    render(<AppointmentList {...defaultProps} />);
    
    // Check that the edit and delete icons are rendered
    // Updated to match the actual icon names in the rendered output
    const editIcons = screen.getAllByTestId('icon-pencil');
    const deleteIcons = screen.getAllByTestId('icon-trash-can');
    
    expect(editIcons).toHaveLength(3); // One for each appointment
    expect(deleteIcons).toHaveLength(3); // One for each appointment
  });

  test('handles different selected date with no appointments', () => {
    // A date with no appointments
    const differentDate = new Date('2023-05-16');
    
    render(
      <AppointmentList 
        {...defaultProps}
        selectedDate={differentDate}
      />
    );
    
    expect(screen.getByText('No appointments for today')).toBeInTheDocument();
  });

  test('renders with correct CSS classes', () => {
    const { container } = render(<AppointmentList {...defaultProps} />);
    
    expect(container.querySelector('.appointment-list')).toBeInTheDocument();
    expect(container.querySelectorAll('.appointment-item')).toHaveLength(3);
    expect(container.querySelectorAll('.appointment-time')).toHaveLength(3);
    expect(container.querySelectorAll('.appointment-title')).toHaveLength(3);
    expect(container.querySelectorAll('.appointment-description')).toHaveLength(2); // Only 2 appointments have descriptions
    expect(container.querySelectorAll('.appointment-actions')).toHaveLength(3);
    expect(container.querySelectorAll('.edit-button')).toHaveLength(3);
    expect(container.querySelectorAll('.delete-button')).toHaveLength(3);
  });
});
