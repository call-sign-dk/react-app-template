import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentsPanel from './AppointmentsPanel';

// Mock dependencies
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }) => <span data-testid="mock-icon" className={className} />
}));

jest.mock('./AppointmentCard', () => {
  return function MockAppointmentCard({ appointment, onEdit, onDelete }) {
    return (
      <div data-testid="appointment-card" className={`mock-appointment ${appointment.priority}`}>
        <div>{appointment.title}</div>
        <button onClick={() => onEdit(appointment)} data-testid="mock-edit-button">Edit</button>
        <button onClick={() => onDelete(appointment.id, appointment.date)} data-testid="mock-delete-button">Delete</button>
      </div>
    );
  };
});

describe('AppointmentsPanel Component', () => {
  const mockAppointments = [
    { id: '1', title: 'Team Meeting', from: '10:00', to: '11:00', priority: 'high', date: '2023-05-15' },
    { id: '2', title: 'Lunch Break', from: '12:00', to: '13:00', priority: 'medium', date: '2023-05-15' }
  ];

  const defaultProps = {
    appointments: mockAppointments,
    onAddAppointment: jest.fn(),
    onEditAppointment: jest.fn(),
    onDeleteAppointment: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders panel header with correct title and appointment count', () => {
    render(<AppointmentsPanel {...defaultProps} />);
    
    expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
    expect(screen.getByText('2 appointments')).toBeInTheDocument();
  });

  test('renders singular appointment count when there is one appointment', () => {
    render(<AppointmentsPanel {...defaultProps} appointments={[mockAppointments[0]]} />);
    
    expect(screen.getByText('1 appointment')).toBeInTheDocument();
  });

  test('renders loading spinner when loading is true', () => {
    render(<AppointmentsPanel {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Loading appointments...')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toHaveClass('panel-icon');
  });

  test('renders empty state when there are no appointments', () => {
    render(<AppointmentsPanel {...defaultProps} appointments={[]} />);
    
    expect(screen.getByText('No appointments scheduled for today')).toBeInTheDocument();
    expect(screen.getByText('Schedule Now')).toBeInTheDocument();
  });

  test('calls onAddAppointment when Schedule Now button is clicked', () => {
    render(<AppointmentsPanel {...defaultProps} appointments={[]} />);
    
    const scheduleButton = screen.getByText('Schedule Now');
    fireEvent.click(scheduleButton);
    
    expect(defaultProps.onAddAppointment).toHaveBeenCalledTimes(1);
  });

  test('renders appointment cards for each appointment', () => {
    render(<AppointmentsPanel {...defaultProps} />);
    
    const appointmentCards = screen.getAllByTestId('appointment-card');
    expect(appointmentCards).toHaveLength(2);
  });

  test('passes correct props to AppointmentCard components', () => {
    render(<AppointmentsPanel {...defaultProps} />);
    
    // Check that the mock appointment cards have the correct classes (priority)
    const appointmentCards = screen.getAllByTestId('appointment-card');
    expect(appointmentCards[0]).toHaveClass('mock-appointment high');
    expect(appointmentCards[1]).toHaveClass('mock-appointment medium');
  });

  test('passes onEditAppointment to AppointmentCard components', () => {
    render(<AppointmentsPanel {...defaultProps} />);
    
    const editButtons = screen.getAllByTestId('mock-edit-button');
    fireEvent.click(editButtons[0]);
    
    expect(defaultProps.onEditAppointment).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEditAppointment).toHaveBeenCalledWith(mockAppointments[0]);
  });

  test('passes onDeleteAppointment to AppointmentCard components', () => {
    render(<AppointmentsPanel {...defaultProps} />);
    
    const deleteButtons = screen.getAllByTestId('mock-delete-button');
    fireEvent.click(deleteButtons[1]);
    
    expect(defaultProps.onDeleteAppointment).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeleteAppointment).toHaveBeenCalledWith(mockAppointments[1].id, mockAppointments[1].date);
  });

  test('renders loading spinner with correct classes', () => {
    const { container } = render(<AppointmentsPanel {...defaultProps} loading={true} />);
    
    const loadingSpinner = container.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
    
    const loadingContainer = container.querySelector('.loading-container');
    expect(loadingContainer).toBeInTheDocument();
  });

  test('renders empty state with correct emoji', () => {
    const { container } = render(<AppointmentsPanel {...defaultProps} appointments={[]} />);
    
    const emptyIcon = container.querySelector('.empty-icon');
    expect(emptyIcon).toBeInTheDocument();
    expect(emptyIcon.textContent).toBe('📅');
  });
});
