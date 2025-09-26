import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as api from './services/api';

// Mock the API functions
jest.mock('./services/api', () => ({
  getAppointments: jest.fn().mockResolvedValue([]),
  getAppointmentsForRange: jest.fn().mockResolvedValue([]),
  createAppointment: jest.fn().mockResolvedValue({}),
  updateAppointment: jest.fn().mockResolvedValue({}),
  deleteAppointment: jest.fn().mockResolvedValue({}),
  fetchSurroundingMonths: jest.fn().mockResolvedValue({})
}));

// Mock components for interaction
jest.mock('./components/Header', () => {
  return function MockHeader(props) {
    return (
      <div data-testid="mock-header">
        <button 
          data-testid="menu-toggle-button" 
          onClick={props.onMenuToggle}
        >
          Toggle Menu
        </button>
      </div>
    );
  };
});

jest.mock('./components/DashboardHeader', () => {
  return function MockDashboardHeader(props) {
    return (
      <div data-testid="mock-dashboard-header">
        <button 
          data-testid="prev-date-button" 
          onClick={props.onPrevDate}
        >
          Previous
        </button>
        <span data-testid="current-date">{props.selectedDate.toDateString()}</span>
        <button 
          data-testid="next-date-button" 
          onClick={props.onNextDate}
        >
          Next
        </button>
        <button 
          data-testid="day-view-button" 
          onClick={() => props.onViewModeChange('day')}
        >
          Day
        </button>
        <button 
          data-testid="week-view-button" 
          onClick={() => props.onViewModeChange('week')}
        >
          Week
        </button>
        <button 
          data-testid="add-appointment-button" 
          onClick={props.onAddAppointment}
        >
          Add Appointment
        </button>
      </div>
    );
  };
});

jest.mock('./components/TimeGrid', () => {
  return function MockTimeGrid(props) {
    return (
      <div data-testid="mock-time-grid">
        <span data-testid="time-grid-date">{props.date.toDateString()}</span>
        <span data-testid="time-grid-view-mode">{props.viewMode}</span>
      </div>
    );
  };
});

jest.mock('./components/MobileMenu', () => {
  return function MockMobileMenu(props) {
    if (!props.isOpen) return null;
    return (
      <div data-testid="mock-mobile-menu">
        <button 
          data-testid="close-mobile-menu-button" 
          onClick={props.onClose}
        >
          Close
        </button>
      </div>
    );
  };
});

jest.mock('./components/AddAppointmentModal', () => {
  return function MockAddAppointmentModal(props) {
    return (
      <div data-testid="mock-appointment-modal">
        <button 
          data-testid="close-modal-button" 
          onClick={props.onClose}
        >
          Close
        </button>
        <button 
          data-testid="save-appointment-button" 
          onClick={() => props.onSave({
            title: 'Test Appointment',
            description: 'Test Description',
            date: '2023-05-15',
            from: '10:00',
            to: '11:00',
            priority: 'medium'
          })}
        >
          Save
        </button>
      </div>
    );
  };
});

// Mock other components to simplify testing
jest.mock('./components/Notification', () => () => null);
jest.mock('./components/AppointmentsPanel', () => () => <div data-testid="mock-appointments-panel">AppointmentsPanel</div>);

// Mock console.log and console.error to reduce noise
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('App Component', () => {
  // Basic rendering tests
  test('renders without crashing', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });
  });

  test('renders main components', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-dashboard-header')).toBeInTheDocument();
      expect(screen.getByTestId('mock-time-grid')).toBeInTheDocument();
      expect(screen.getByTestId('mock-appointments-panel')).toBeInTheDocument();
    });
  });

  // Mobile menu tests
  test('toggles mobile menu', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Mobile menu should not be visible initially
    expect(screen.queryByTestId('mock-mobile-menu')).not.toBeInTheDocument();
    
    // Click the menu toggle button
    await act(async () => {
      fireEvent.click(screen.getByTestId('menu-toggle-button'));
    });
    
    // Mobile menu should now be visible
    expect(screen.getByTestId('mock-mobile-menu')).toBeInTheDocument();
    
    // Click the close button
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-mobile-menu-button'));
    });
    
    // Mobile menu should be hidden again
    expect(screen.queryByTestId('mock-mobile-menu')).not.toBeInTheDocument();
  });

  // Date navigation tests
  test('navigates between dates', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Get the initial date
    const initialDate = screen.getByTestId('current-date').textContent;
    
    // Click the previous date button
    await act(async () => {
      fireEvent.click(screen.getByTestId('prev-date-button'));
    });
    
    // Date should have changed
    expect(screen.getByTestId('current-date').textContent).not.toBe(initialDate);
    
    const prevDate = screen.getByTestId('current-date').textContent;
    
    // Click the next date button
    await act(async () => {
      fireEvent.click(screen.getByTestId('next-date-button'));
    });
    
    // Date should be back to initial
    expect(screen.getByTestId('current-date').textContent).toBe(initialDate);
    
    // Click next again
    await act(async () => {
      fireEvent.click(screen.getByTestId('next-date-button'));
    });
    
    // Date should have changed to a new date
    expect(screen.getByTestId('current-date').textContent).not.toBe(initialDate);
    expect(screen.getByTestId('current-date').textContent).not.toBe(prevDate);
  });

  // View mode tests
  test('switches between day and week views', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Should start in day view
    expect(screen.getByTestId('time-grid-view-mode').textContent).toBe('day');
    
    // Switch to week view
    await act(async () => {
      fireEvent.click(screen.getByTestId('week-view-button'));
    });
    
    // Should now be in week view
    expect(screen.getByTestId('time-grid-view-mode').textContent).toBe('week');
    
    // Switch back to day view
    await act(async () => {
      fireEvent.click(screen.getByTestId('day-view-button'));
    });
    
    // Should be back in day view
    expect(screen.getByTestId('time-grid-view-mode').textContent).toBe('day');
  });

  // Modal tests
  test('opens and closes appointment modal', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Modal should not be visible initially
    expect(screen.queryByTestId('mock-appointment-modal')).not.toBeInTheDocument();
    
    // Click the add appointment button
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-appointment-button'));
    });
    
    // Modal should now be visible
    expect(screen.getByTestId('mock-appointment-modal')).toBeInTheDocument();
    
    // Click the close button
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-modal-button'));
    });
    
    // Modal should be hidden again
    expect(screen.queryByTestId('mock-appointment-modal')).not.toBeInTheDocument();
  });

  // API interaction tests
  test('fetches appointments on initial load', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Should call getAppointments and fetchSurroundingMonths on initial load
    expect(api.getAppointments).toHaveBeenCalled();
    expect(api.fetchSurroundingMonths).toHaveBeenCalled();
  });

  test('fetches appointments when date changes', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Clear the mock to track new calls
    api.getAppointments.mockClear();
    
    // Change the date
    await act(async () => {
      fireEvent.click(screen.getByTestId('next-date-button'));
    });
    
    // Should call getAppointments again with the new date
    expect(api.getAppointments).toHaveBeenCalled();
  });

  test('fetches appointments for range when switching to week view', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Clear the mocks
    api.getAppointments.mockClear();
    api.getAppointmentsForRange.mockClear();
    
    // Switch to week view
    await act(async () => {
      fireEvent.click(screen.getByTestId('week-view-button'));
    });
    
    // Should call getAppointmentsForRange
    expect(api.getAppointmentsForRange).toHaveBeenCalled();
  });

  test('creates a new appointment', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Click the add appointment button
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-appointment-button'));
    });
    
    // Modal should be visible
    expect(screen.getByTestId('mock-appointment-modal')).toBeInTheDocument();
    
    // Clear the mock to track new calls
    api.createAppointment.mockClear();
    
    // Click the save button
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-appointment-button'));
    });
    
    // Should call createAppointment API
    expect(api.createAppointment).toHaveBeenCalled();
    
    // Modal should be closed
    expect(screen.queryByTestId('mock-appointment-modal')).not.toBeInTheDocument();
  });
});
