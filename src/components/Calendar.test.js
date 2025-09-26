import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar from './Calendar';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }) => {
    // Use the icon's iconName property to identify which icon is being rendered
    return <span data-testid={`icon-${icon.iconName || 'unknown'}`} className={className} />;
  }
}));

// Mock the icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faChevronLeft: { iconName: 'chevron-left' },
  faChevronRight: { iconName: 'chevron-right' }
}));

describe('Calendar Component', () => {
  // Fixed date for testing to avoid test flakiness
  const testDate = new Date(2023, 4, 15); // May 15, 2023
  const setSelectedDate = jest.fn();
  const setShowCalendar = jest.fn();
  
  // Store the original Date
  const RealDate = global.Date;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Date to return fixed date for 'new Date()' but use real Date for everything else
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate(2023, 4, 15); // May 15, 2023 for 'new Date()'
        }
        return new RealDate(...args);
      }
      
      // Make sure static methods like Date.now() work
      static now() {
        return new RealDate(2023, 4, 15).getTime();
      }
    };
    
    // Make sure toDateString returns the expected value for comparison
    global.Date.prototype.toDateString = function() {
      if (this.getFullYear() === 2023 && this.getMonth() === 4 && this.getDate() === 15) {
        return new RealDate(2023, 4, 15).toDateString();
      }
      return RealDate.prototype.toDateString.call(this);
    };
  });
  
  afterEach(() => {
    // Restore the original Date
    global.Date = RealDate;
  });
  
  test('renders calendar with correct month and year', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    expect(screen.getByText('May 2023')).toBeInTheDocument();
  });
  
  test('renders day headers (Su, Mo, Tu, etc.)', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    expect(screen.getByText('Su')).toBeInTheDocument();
    expect(screen.getByText('Mo')).toBeInTheDocument();
    expect(screen.getByText('Tu')).toBeInTheDocument();
    expect(screen.getByText('We')).toBeInTheDocument();
    expect(screen.getByText('Th')).toBeInTheDocument();
    expect(screen.getByText('Fr')).toBeInTheDocument();
    expect(screen.getByText('Sa')).toBeInTheDocument();
  });
  
  test('renders days of the month correctly', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // May 2023 has 31 days, check for some of them
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });
  
  test('highlights the selected date', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Find the element containing the day "15" (our test date)
    const selectedDay = screen.getByText('15').closest('.calendar-day');
    expect(selectedDay).toHaveClass('selected');
  });
  
  test('highlights today', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Since we mocked Date to return testDate (May 15, 2023),
    // the element containing "15" should have the "today" class
    const todayElement = screen.getByText('15').closest('.calendar-day');
    expect(todayElement).toHaveClass('today');
  });
  
  test('navigates to previous month when left arrow is clicked', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Find and click the previous month button
    const prevButton = screen.getByTestId('icon-chevron-left').closest('button');
    fireEvent.click(prevButton);
    
    // setSelectedDate should be called with a date in April 2023
    expect(setSelectedDate).toHaveBeenCalled();
    const newDate = setSelectedDate.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(3); // April is month 3 (0-indexed)
    expect(newDate.getFullYear()).toBe(2023);
  });
  
  test('navigates to next month when right arrow is clicked', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Find and click the next month button
    const nextButton = screen.getByTestId('icon-chevron-right').closest('button');
    fireEvent.click(nextButton);
    
    // setSelectedDate should be called with a date in June 2023
    expect(setSelectedDate).toHaveBeenCalled();
    const newDate = setSelectedDate.mock.calls[0][0];
    expect(newDate.getMonth()).toBe(5); // June is month 5 (0-indexed)
    expect(newDate.getFullYear()).toBe(2023);
  });
  
  test('selects a date and closes calendar when a day is clicked', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Find and click on day 20
    const day20 = screen.getByText('20').closest('.calendar-day');
    fireEvent.click(day20);
    
    // setSelectedDate should be called with May 20, 2023
    expect(setSelectedDate).toHaveBeenCalled();
    const newDate = setSelectedDate.mock.calls[0][0];
    expect(newDate.getDate()).toBe(20);
    expect(newDate.getMonth()).toBe(4); // May is month 4 (0-indexed)
    expect(newDate.getFullYear()).toBe(2023);
    
    // Calendar should be closed
    expect(setShowCalendar).toHaveBeenCalledWith(false);
  });
  
  test('closes calendar when clicking outside', () => {
    // Create a div to serve as the "outside" area
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />,
      { container }
    );
    
    // Simulate a click outside the calendar
    act(() => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(mouseDownEvent);
    });
    
    // Calendar should be closed
    expect(setShowCalendar).toHaveBeenCalledWith(false);
    
    // Clean up
    document.body.removeChild(container);
  });
  
  test('does not close calendar when clicking inside', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Find the calendar container
    const calendarContainer = screen.getByText('May 2023').closest('.calendar-dropdown-container');
    
    // Simulate a click inside the calendar
    fireEvent.mouseDown(calendarContainer);
    
    // Calendar should not be closed
    expect(setShowCalendar).not.toHaveBeenCalled();
  });
  
  test('renders empty days before the first day of the month', () => {
    render(
      <Calendar
        selectedDate={testDate}
        setSelectedDate={setSelectedDate}
        showCalendar={true}
        setShowCalendar={setShowCalendar}
      />
    );
    
    // Check for empty day elements
    const emptyDays = document.querySelectorAll('.empty-day');
    expect(emptyDays.length).toBeGreaterThan(0);
  });
});
