import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardHeader from './DashboardHeader';
import { formatDateDisplay } from '../utils/timeUtils';

// Mock the formatDateDisplay function and Calendar component
jest.mock('../utils/timeUtils', () => ({
  formatDateDisplay: jest.fn().mockImplementation(date => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })
}));

jest.mock('./Calendar', () => {
  return function MockCalendar() {
    return <div data-testid="mock-calendar">Calendar Component</div>;
  };
});

describe('DashboardHeader Component', () => {
  const mockDate = new Date('2023-05-15T12:00:00');
  const defaultProps = {
    selectedDate: mockDate,
    onPrevDate: jest.fn(),
    onNextDate: jest.fn(),
    viewMode: 'day',
    onViewModeChange: jest.fn(),
    onAddAppointment: jest.fn(),
    showCalendar: false,
    setShowCalendar: jest.fn(),
    setSelectedDate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard header with date selector', () => {
    render(<DashboardHeader {...defaultProps} />);
    expect(screen.getByText(/new appointment/i)).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  test('calls onPrevDate when previous button is clicked', () => {
    const { container } = render(<DashboardHeader {...defaultProps} />);
    const prevButton = container.querySelector('.prev-button');
    fireEvent.click(prevButton);
    expect(defaultProps.onPrevDate).toHaveBeenCalledTimes(1);
  });

  test('calls onNextDate when next button is clicked', () => {
    const { container } = render(<DashboardHeader {...defaultProps} />);
    const nextButton = container.querySelector('.next-button');
    fireEvent.click(nextButton);
    expect(defaultProps.onNextDate).toHaveBeenCalledTimes(1);
  });

  test('toggles calendar visibility when calendar button is clicked', () => {
    const { container } = render(<DashboardHeader {...defaultProps} />);
    const calendarButton = container.querySelector('.calendar-button');
    fireEvent.click(calendarButton);
    expect(defaultProps.setShowCalendar).toHaveBeenCalledWith(true);
  });

  test('displays calendar when showCalendar is true', () => {
    render(<DashboardHeader {...defaultProps} showCalendar={true} />);
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });

  test('does not display calendar when showCalendar is false', () => {
    render(<DashboardHeader {...defaultProps} showCalendar={false} />);
    expect(screen.queryByTestId('mock-calendar')).not.toBeInTheDocument();
  });

  test('calls onViewModeChange with "day" when day button is clicked', () => {
    render(<DashboardHeader {...defaultProps} viewMode="week" />);
    const dayButton = screen.getByRole('button', { name: 'Day' });
    fireEvent.click(dayButton);
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('day');
  });

  test('calls onViewModeChange with "week" when week button is clicked', () => {
    render(<DashboardHeader {...defaultProps} viewMode="day" />);
    const weekButton = screen.getByRole('button', { name: 'Week' });
    fireEvent.click(weekButton);
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('week');
  });

  test('applies active class to the current view mode button', () => {
    const { container } = render(<DashboardHeader {...defaultProps} viewMode="day" />);
    const dayButton = screen.getByRole('button', { name: 'Day' });
    const weekButton = screen.getByRole('button', { name: 'Week' });
    
    expect(dayButton).toHaveClass('active');
    expect(weekButton).not.toHaveClass('active');
  });

  test('calls onAddAppointment when add appointment button is clicked', () => {
    render(<DashboardHeader {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /new appointment/i });
    fireEvent.click(addButton);
    expect(defaultProps.onAddAppointment).toHaveBeenCalledTimes(1);
  });

  test('displays formatted date in day view', () => {
    formatDateDisplay.mockReturnValueOnce('May 15, 2023');
    render(<DashboardHeader {...defaultProps} viewMode="day" />);
    expect(formatDateDisplay).toHaveBeenCalledWith(mockDate);
    expect(formatDateDisplay).toHaveReturnedWith('May 15, 2023');
  });

  test('displays week range in week view', () => {
    render(<DashboardHeader {...defaultProps} viewMode="week" />);
    // We're just checking that formatWeekRange is called indirectly
    // by verifying that formatDateDisplay is not called in week view
    expect(formatDateDisplay).not.toHaveBeenCalled();
  });

  test('shows up chevron when calendar is visible', () => {
    const { container } = render(<DashboardHeader {...defaultProps} showCalendar={true} />);
    const upChevron = container.querySelector('.fa-chevron-up');
    expect(upChevron).toBeInTheDocument();
  });

  test('shows down chevron when calendar is hidden', () => {
    const { container } = render(<DashboardHeader {...defaultProps} showCalendar={false} />);
    const downChevron = container.querySelector('.fa-chevron-down');
    expect(downChevron).toBeInTheDocument();
  });
});
