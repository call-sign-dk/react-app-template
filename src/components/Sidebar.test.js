import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: function MockFontAwesomeIcon(props) {
    return <span data-testid={`icon-${props.icon.iconName || 'default'}`} className={props.className} />;
  }
}));

// Mock the AppointmentList component
jest.mock('./AppointmentList', () => {
  return function MockAppointmentList({ appointments, onEdit, onDelete }) {
    return (
      <div data-testid="appointment-list">
        <span>Appointments Count: {appointments.length}</span>
        {appointments.map((appointment, index) => (
          <div key={index} data-testid="appointment-item">
            <span>{appointment.title}</span>
            <button onClick={() => onEdit(appointment)}>Edit</button>
            <button onClick={() => onDelete(appointment.id, appointment.date)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
});

describe('Sidebar Component', () => {
  const mockDate = new Date('2023-05-15');
  const mockAppointments = [
    { id: '1', title: 'Team Meeting', date: '2023-05-15' },
    { id: '2', title: 'Lunch Break', date: '2023-05-15' }
  ];
  
  const defaultProps = {
    date: mockDate,
    onPrev: jest.fn(),
    onNext: jest.fn(),
    appointments: mockAppointments,
    onSelectDate: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with correct title', () => {
    render(<Sidebar {...defaultProps} />);
    
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Recent & Upcoming Appointments')).toBeInTheDocument();
  });

  test('displays current month correctly', () => {
    render(<Sidebar {...defaultProps} />);
    
    // Use querySelector to specifically target the current-month div
    const currentMonthElement = document.querySelector('.current-month');
    expect(currentMonthElement).toHaveTextContent('May');
  });

  test('calls onPrev when previous button is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    
    const prevButtons = screen.getAllByRole('button');
    // First button should be the prev button
    fireEvent.click(prevButtons[0]);
    
    expect(defaultProps.onPrev).toHaveBeenCalledTimes(1);
  });

  test('calls onNext when next button is clicked', () => {
    render(<Sidebar {...defaultProps} />);
    
    const nextButtons = screen.getAllByRole('button');
    // Second button should be the next button
    fireEvent.click(nextButtons[1]);
    
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  test('renders month dropdown with all months', () => {
    render(<Sidebar {...defaultProps} />);
    
    // Use querySelector to specifically target the month-select
    const monthSelect = document.querySelector('.month-select');
    expect(monthSelect).toBeInTheDocument();
    
    // Check that all months are in the dropdown
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      const option = screen.getAllByText(month)[0]; // Get the first occurrence if there are multiple
      expect(option).toBeInTheDocument();
    });
  });

  test('calls onSelectDate when month is changed', () => {
    render(<Sidebar {...defaultProps} />);
    
    // Use querySelector to specifically target the month-select
    const monthSelect = document.querySelector('.month-select');
    
    // Change to June (index 5)
    fireEvent.change(monthSelect, { target: { value: '5' } });
    
    expect(defaultProps.onSelectDate).toHaveBeenCalledTimes(1);
    
    // Check that a new date with the selected month was passed
    const newDate = defaultProps.onSelectDate.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(5); // June
    expect(newDate.getFullYear()).toBe(2023);
    expect(newDate.getDate()).toBe(15);
  });

  test('calls onSelectDate when year is changed', () => {
    render(<Sidebar {...defaultProps} />);
    
    // Use querySelector to specifically target the year-select
    const yearSelect = document.querySelector('.year-select');
    
    // Change to 2024
    fireEvent.change(yearSelect, { target: { value: '2024' } });
    
    expect(defaultProps.onSelectDate).toHaveBeenCalledTimes(1);
    
    // Check that a new date with the selected year was passed
    const newDate = defaultProps.onSelectDate.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(4); // May
    expect(newDate.getFullYear()).toBe(2024);
    expect(newDate.getDate()).toBe(15);
  });

  test('renders AppointmentList with correct props', () => {
    render(<Sidebar {...defaultProps} />);
    
    expect(screen.getByTestId('appointment-list')).toBeInTheDocument();
    expect(screen.getByText('Appointments Count: 2')).toBeInTheDocument();
    expect(screen.getAllByTestId('appointment-item')).toHaveLength(2);
  });

  test('passes onEdit callback to AppointmentList', () => {
    render(<Sidebar {...defaultProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAppointments[0]);
  });

  test('passes onDelete callback to AppointmentList', () => {
    render(<Sidebar {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]);
    
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAppointments[1].id, mockAppointments[1].date);
  });

  test('renders year dropdown with correct range', () => {
    render(<Sidebar {...defaultProps} />);
    
    // Use querySelector to specifically target the year-select
    const yearSelect = document.querySelector('.year-select');
    expect(yearSelect).toBeInTheDocument();
    
    // Check that the current year and surrounding years are in the dropdown
    const currentYear = mockDate.getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  test('renders with correct CSS classes', () => {
    const { container } = render(<Sidebar {...defaultProps} />);
    
    expect(container.querySelector('.sidebar')).toBeInTheDocument();
    expect(container.querySelector('.date-navigation')).toBeInTheDocument();
    expect(container.querySelector('.calendar-dropdown')).toBeInTheDocument();
    expect(container.querySelector('.appointments-section')).toBeInTheDocument();
    expect(container.querySelector('.appointments-container')).toBeInTheDocument();
  });
});
