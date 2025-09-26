import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentCard from './AppointmentCard';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('AppointmentCard Component', () => {
  const mockAppointment = {
    id: '123',
    title: 'Team Meeting',
    description: 'Weekly team sync-up',
    from: '10:00',
    to: '11:00',
    priority: 'high',
    date: '2023-05-15'
  };

  const defaultProps = {
    appointment: mockAppointment,
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders appointment card with correct details', () => {
    render(<AppointmentCard {...defaultProps} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Weekly team sync-up')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
  });

  test('renders appointment without description when not provided', () => {
    const appointmentWithoutDesc = {
      ...mockAppointment,
      description: null
    };
    
    render(<AppointmentCard appointment={appointmentWithoutDesc} onEdit={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Weekly team sync-up')).not.toBeInTheDocument();
  });

  test('applies correct priority class to the indicator', () => {
    const { container } = render(<AppointmentCard {...defaultProps} />);
    
    const priorityIndicator = container.querySelector('.priority-indicator');
    expect(priorityIndicator).toHaveClass('high');
  });

  test('calls onEdit when edit button is clicked', () => {
    render(<AppointmentCard {...defaultProps} />);
    
    const editButton = screen.getByTitle('Edit appointment');
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAppointment);
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<AppointmentCard {...defaultProps} />);
    
    const deleteButton = screen.getByTitle('Delete appointment');
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppointment.id, mockAppointment.date);
  });

  test('renders with different priority levels', () => {
    // Test medium priority
    const mediumPriorityAppointment = {
      ...mockAppointment,
      priority: 'medium'
    };
    
    const { container: mediumContainer } = render(
      <AppointmentCard 
        appointment={mediumPriorityAppointment} 
        onEdit={jest.fn()} 
        onDelete={jest.fn()} 
      />
    );
    
    const mediumIndicator = mediumContainer.querySelector('.priority-indicator');
    expect(mediumIndicator).toHaveClass('medium');
    
    // Test low priority
    const lowPriorityAppointment = {
      ...mockAppointment,
      priority: 'low'
    };
    
    const { container: lowContainer } = render(
      <AppointmentCard 
        appointment={lowPriorityAppointment} 
        onEdit={jest.fn()} 
        onDelete={jest.fn()} 
      />
    );
    
    const lowIndicator = lowContainer.querySelector('.priority-indicator');
    expect(lowIndicator).toHaveClass('low');
  });

  test('renders time with icon', () => {
    render(<AppointmentCard {...defaultProps} />);
    
    const timeElement = screen.getByText('10:00 - 11:00');
    expect(timeElement).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-icon')[0]).toBeInTheDocument(); // First icon is the clock
  });
});
