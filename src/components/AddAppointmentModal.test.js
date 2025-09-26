import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddAppointmentModal from './AddAppointmentModal';

// Mock the CustomTimePicker component since it's a dependency
jest.mock('./CustomTimePicker', () => {
  return function MockCustomTimePicker({ value, onChange, label, isStart }) {
    return (
      <div data-testid={`time-picker-${isStart ? 'start' : 'end'}`}>
        <label>{label}</label>
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          data-testid={`time-input-${isStart ? 'start' : 'end'}`}
        />
      </div>
    );
  };
});

// Mock FontAwesomeIcon to avoid SVG rendering issues in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('AddAppointmentModal Component', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onSave: jest.fn(),
    defaultDate: new Date('2023-05-15'),
    editingAppointment: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the modal with correct title for new appointment', () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    expect(screen.getByText('New Appointment')).toBeInTheDocument();
    expect(screen.getByText('Book Appointment')).toBeInTheDocument();
  });

  test('renders the modal with correct title for editing appointment', () => {
    const editingAppointment = {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly sync',
      date: '2023-05-15',
      from: '10:00',
      to: '11:00',
      priority: 'high'
    };
    
    render(<AddAppointmentModal {...defaultProps} editingAppointment={editingAppointment} />);
    
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByText('Update Appointment')).toBeInTheDocument();
  });

  test('populates form with appointment data when editing', () => {
    const editingAppointment = {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly sync',
      date: '2023-05-15',
      from: '10:00',
      to: '11:00',
      priority: 'high'
    };
    
    render(<AddAppointmentModal {...defaultProps} editingAppointment={editingAppointment} />);
    
    // Check that form fields are populated with appointment data
    expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Weekly sync')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-05-15')).toBeInTheDocument();
    
    // Check that the high priority option is selected
    const highPriorityRadio = screen.getByLabelText('High');
    expect(highPriorityRadio).toBeChecked();
  });

  test('validates form and shows error messages', async () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    // Try to save without filling required fields
    const saveButton = screen.getByText('Book Appointment');
    fireEvent.click(saveButton);
    
    // Check that error messages are displayed
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Start time is required')).toBeInTheDocument();
      expect(screen.getByText('End time is required')).toBeInTheDocument();
    });
  });

  test('validates time and shows error when end time is before start time', async () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    // Set start time later than end time
    const startTimeInput = screen.getByTestId('time-input-start');
    const endTimeInput = screen.getByTestId('time-input-end');
    
    // Fill out the form to avoid required field errors
    fireEvent.change(screen.getByPlaceholderText('e.g., Team Meeting'), { target: { value: 'Test Meeting' } });
    fireEvent.change(screen.getByPlaceholderText('Add details about your appointment'), { target: { value: 'Test details' } });
    
    // Set the times
    fireEvent.change(startTimeInput, { target: { value: '14:00' } });
    fireEvent.change(endTimeInput, { target: { value: '13:00' } });
    
    // The component should now show a time error
    // Looking at the component code, the error is shown in a div with className="time-error"
    await waitFor(() => {
      const timeErrorElement = document.querySelector('.time-error');
      expect(timeErrorElement).toBeInTheDocument();
      expect(timeErrorElement.textContent).toContain('End time must be after start time');
    });
    
    // Save button should be disabled
    const saveButton = screen.getByText('Book Appointment');
    expect(saveButton).toHaveAttribute('disabled');
  });

  test('calls onSave with correct data when form is valid', async () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('e.g., Team Meeting'), { target: { value: 'New Meeting' } });
    fireEvent.change(screen.getByPlaceholderText('Add details about your appointment'), { target: { value: 'Meeting details' } });
    
    // Set times
    const startTimeInput = screen.getByTestId('time-input-start');
    const endTimeInput = screen.getByTestId('time-input-end');
    
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    
    // Select medium priority
    const mediumPriorityRadio = screen.getByLabelText('Medium');
    fireEvent.click(mediumPriorityRadio);
    
    // Submit the form
    const saveButton = screen.getByText('Book Appointment');
    fireEvent.click(saveButton);
    
    // Check that onSave was called with the correct data
    expect(defaultProps.onSave).toHaveBeenCalledWith({
      date: '2023-05-15',
      from: '09:00',
      to: '10:00',
      title: 'New Meeting',
      description: 'Meeting details',
      priority: 'medium'
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('calls onClose when clicking outside the modal', () => {
    const { container } = render(<AddAppointmentModal {...defaultProps} />);
    
    // Find the modal overlay (the background)
    const modalOverlay = container.querySelector('.modal-overlay');
    
    // Click on the overlay (outside the modal content)
    fireEvent.click(modalOverlay);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('shows duration when valid times are selected', async () => {
    render(<AddAppointmentModal {...defaultProps} />);
    
    // Set times
    const startTimeInput = screen.getByTestId('time-input-start');
    const endTimeInput = screen.getByTestId('time-input-end');
    
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:30' } });
    
    // Check that duration is displayed
    await waitFor(() => {
      const durationElement = document.querySelector('.duration-display');
      expect(durationElement).toBeInTheDocument();
      expect(durationElement.textContent).toContain('Duration: 1h 30m');
    });
  });
});
