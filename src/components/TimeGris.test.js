import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeGrid from './TimeGrid';

// Mock FontAwesomeIcon to avoid issues with SVG rendering in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: function MockFontAwesomeIcon(props) {
    return <span data-testid={`icon-${props.icon.iconName || 'default'}`} className={props.className} />;
  }
}));

// Don't mock the timeUtils functions - use the actual implementations
jest.mock('../utils/timeUtils', () => {
  const originalModule = jest.requireActual('../utils/timeUtils');
  return {
    ...originalModule,
    // We can add specific mocks here if needed
  };
});

describe('TimeGrid Component', () => {
  // Basic tests that don't depend on appointments rendering
  
  test('renders loading spinner when loading is true', () => {
    const { container } = render(
      <TimeGrid 
        date={new Date()} 
        appointments={{}} 
        loading={true} 
      />
    );
    
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  test('renders day view when viewMode is day', () => {
    render(
      <TimeGrid 
        date={new Date()} 
        appointments={{}} 
        loading={false} 
        viewMode="day" 
      />
    );
    
    expect(screen.getByText('Daily Schedule')).toBeInTheDocument();
  });

  test('renders week view when viewMode is week', () => {
    render(
      <TimeGrid 
        date={new Date()} 
        appointments={{}} 
        loading={false} 
        viewMode="week" 
      />
    );
    
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
  });

  test('renders all 24 hours in day view', () => {
    const { container } = render(
      <TimeGrid 
        date={new Date()} 
        appointments={{}} 
        loading={false} 
        viewMode="day" 
      />
    );
    
    // Count all hour labels
    const hourLabels = container.querySelectorAll('.hour-label');
    expect(hourLabels).toHaveLength(24);
  });

  test('renders 7 days in week view', () => {
    const { container } = render(
      <TimeGrid 
        date={new Date()} 
        appointments={{}} 
        loading={false} 
        viewMode="week" 
      />
    );
    
    // Check that 7 day headers are rendered
    const dayHeaders = container.querySelectorAll('.week-day-header');
    expect(dayHeaders).toHaveLength(7);
  });

  // Test with appointments - using a more direct approach
  test('renders appointments in day view', () => {
    // Create a date object for May 15, 2023
    const testDate = new Date(2023, 4, 15); // Month is 0-indexed, so 4 = May
    
    // Create appointments directly with the date key that matches the date
    const appointments = {
      '2023-05-15': [
        {
          id: '1',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          from: '10:00',
          to: '11:00',
          priority: 'high',
          date: '2023-05-15'
        },
        {
          id: '2',
          title: 'Lunch Break',
          from: '12:30',
          to: '13:30',
          priority: 'medium',
          date: '2023-05-15'
        }
      ]
    };
    
    const { container, debug } = render(
      <TimeGrid 
        date={testDate} 
        appointments={appointments} 
        loading={false} 
        viewMode="day" 
        onEditAppointment={jest.fn()}
      />
    );
    
    // Debug the rendered output to see what's actually being rendered
    debug();
    
    // Check for timeline-appointment elements
    const appointmentElements = container.querySelectorAll('.timeline-appointment');
    expect(appointmentElements.length).toBeGreaterThan(0);
  });
});
