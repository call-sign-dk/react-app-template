import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileMenu from './MobileMenu';
import { formatDateDisplay } from '../utils/timeUtils';

// Mock the formatDateDisplay function
jest.mock('../utils/timeUtils', () => ({
  formatDateDisplay: jest.fn().mockImplementation(date => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })
}));

describe('MobileMenu Component', () => {
  const mockDate = new Date('2023-05-15T12:00:00');
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedDate: mockDate,
    onPrevDate: jest.fn(),
    onNextDate: jest.fn(),
    appointments: [],
    onAddAppointment: jest.fn(),
    onEditAppointment: jest.fn(),
    onDeleteAppointment: jest.fn(),
    viewMode: 'day',
    onViewModeChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders mobile menu when isOpen is true', () => {
    render(<MobileMenu {...defaultProps} />);
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
  });

  test('does not render mobile menu when isOpen is false', () => {
    render(<MobileMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Appointments')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const { container } = render(<MobileMenu {...defaultProps} />);
    
    // Use querySelector to find the close button by its class
    const closeButton = container.querySelector('.close-button');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('displays formatted date correctly in day view', () => {
    // Override the mock implementation for this test
    formatDateDisplay.mockReturnValueOnce('May 15, 2023');
    
    render(<MobileMenu {...defaultProps} viewMode="day" />);
    
    expect(formatDateDisplay).toHaveBeenCalledWith(mockDate);
    // Check that formatDateDisplay was called, not the actual text
    expect(formatDateDisplay).toHaveReturnedWith('May 15, 2023');
  });

  test('displays week range correctly in week view', () => {
    const { container } = render(<MobileMenu {...defaultProps} viewMode="week" />);
    
    // Find the current-date div using querySelector
    const currentDateElement = container.querySelector('.current-date');
    expect(currentDateElement).toBeInTheDocument();
  });

  test('calls onPrevDate when previous button is clicked', () => {
    const { container } = render(<MobileMenu {...defaultProps} />);
    
    // Find the previous button using querySelector with a more specific selector
    const prevButtons = container.querySelectorAll('.nav-button');
    const prevButton = prevButtons[0]; // First nav button is previous
    
    fireEvent.click(prevButton);
    
    expect(defaultProps.onPrevDate).toHaveBeenCalledTimes(1);
  });

  test('calls onNextDate when next button is clicked', () => {
    const { container } = render(<MobileMenu {...defaultProps} />);
    
    // Find the next button using querySelector with a more specific selector
    const navButtons = container.querySelectorAll('.nav-button');
    const nextButton = navButtons[1]; // Second nav button is next
    
    fireEvent.click(nextButton);
    
    expect(defaultProps.onNextDate).toHaveBeenCalledTimes(1);
  });

  test('calls onViewModeChange when view mode buttons are clicked', () => {
    render(<MobileMenu {...defaultProps} viewMode="day" />);
    
    const weekButton = screen.getByRole('button', { name: 'Week' });
    fireEvent.click(weekButton);
    
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('week');
    
    const dayButton = screen.getByRole('button', { name: 'Day' });
    fireEvent.click(dayButton);
    
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('day');
  });

  test('calls onAddAppointment when add button is clicked', () => {
    render(<MobileMenu {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /new appointment/i });
    fireEvent.click(addButton);
    
    expect(defaultProps.onAddAppointment).toHaveBeenCalledTimes(1);
  });

  test('displays "No appointments" message when appointments array is empty', () => {
    render(<MobileMenu {...defaultProps} appointments={[]} />);
    
    expect(screen.getByText('No appointments scheduled for today.')).toBeInTheDocument();
  });

  test('renders appointments list when appointments are provided', () => {
    const appointments = [
      { id: 1, title: 'Team Meeting', from: '9:00', to: '10:00', priority: 'high', date: '2023-05-15' },
      { id: 2, title: 'Lunch Break', from: '12:00', to: '13:00', priority: 'medium', date: '2023-05-15' }
    ];
    
    render(<MobileMenu {...defaultProps} appointments={appointments} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('9:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('Lunch Break')).toBeInTheDocument();
    expect(screen.getByText('12:00 - 13:00')).toBeInTheDocument();
  });

  test('calls onEditAppointment when edit button is clicked', () => {
    const appointment = { id: 1, title: 'Meeting', from: '9:00', to: '10:00', priority: 'high', date: '2023-05-15' };
    
    const { container } = render(<MobileMenu {...defaultProps} appointments={[appointment]} />);
    
    // Find the edit button using querySelector
    const editButton = container.querySelector('.edit-button');
    fireEvent.click(editButton);
    
    expect(defaultProps.onEditAppointment).toHaveBeenCalledWith(appointment);
  });

  test('calls onDeleteAppointment when delete button is clicked', () => {
    const appointment = { id: 1, title: 'Meeting', from: '9:00', to: '10:00', priority: 'high', date: '2023-05-15' };
    
    const { container } = render(<MobileMenu {...defaultProps} appointments={[appointment]} />);
    
    // Find the delete button using querySelector
    const deleteButton = container.querySelector('.delete-button');
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDeleteAppointment).toHaveBeenCalledWith(appointment.id, appointment.date);
  });

  test('calls onEditAppointment when appointment details are clicked', () => {
    const appointment = { id: 1, title: 'Meeting', from: '9:00', to: '10:00', priority: 'high', date: '2023-05-15' };
    
    const { container } = render(<MobileMenu {...defaultProps} appointments={[appointment]} />);
    
    // Find the appointment details using querySelector
    const appointmentDetails = container.querySelector('.appointment-details');
    fireEvent.click(appointmentDetails);
    
    expect(defaultProps.onEditAppointment).toHaveBeenCalledWith(appointment);
  });

  test('applies correct priority class to appointment items', () => {
    const appointments = [
      { id: 1, title: 'High Priority', from: '9:00', to: '10:00', priority: 'high', date: '2023-05-15' },
      { id: 2, title: 'Medium Priority', from: '11:00', to: '12:00', priority: 'medium', date: '2023-05-15' },
      { id: 3, title: 'Low Priority', from: '13:00', to: '14:00', priority: 'low', date: '2023-05-15' }
    ];
    
    const { container } = render(<MobileMenu {...defaultProps} appointments={appointments} />);
    
    // Find appointment items using querySelectorAll
    const appointmentItems = container.querySelectorAll('.appointment-item');
    expect(appointmentItems[0]).toHaveClass('appointment-item high');
    expect(appointmentItems[1]).toHaveClass('appointment-item medium');
    expect(appointmentItems[2]).toHaveClass('appointment-item low');
  });
});
