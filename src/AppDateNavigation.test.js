import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock API calls
jest.mock('./services/api', () => ({
  getAppointments: jest.fn().mockResolvedValue([]),
  getAppointmentsForRange: jest.fn().mockResolvedValue([]),
  createAppointment: jest.fn().mockResolvedValue({}),
  updateAppointment: jest.fn().mockResolvedValue({}),
  deleteAppointment: jest.fn().mockResolvedValue({}),
  fetchSurroundingMonths: jest.fn().mockResolvedValue({})
}));

// Mock only the components we need to interact with
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
      </div>
    );
  };
});

// Mock other components to simplify testing
jest.mock('./components/Header', () => () => <div>Header</div>);
jest.mock('./components/TimeGrid', () => () => <div>TimeGrid</div>);
jest.mock('./components/AddAppointmentModal', () => () => null);
jest.mock('./components/Notification', () => () => null);
jest.mock('./components/AppointmentsPanel', () => () => <div>AppointmentsPanel</div>);
jest.mock('./components/MobileMenu', () => () => null);

test('navigates to previous date when prev button is clicked', () => {
  render(<App />);
  
  // Get the initial date
  const initialDate = screen.getByTestId('current-date').textContent;
  
  // Click the previous date button
  fireEvent.click(screen.getByTestId('prev-date-button'));
  
  // Date should have changed
  expect(screen.getByTestId('current-date').textContent).not.toBe(initialDate);
});

test('navigates to next date when next button is clicked', () => {
  render(<App />);
  
  // Get the initial date
  const initialDate = screen.getByTestId('current-date').textContent;
  
  // Click the next date button
  fireEvent.click(screen.getByTestId('next-date-button'));
  
  // Date should have changed
  expect(screen.getByTestId('current-date').textContent).not.toBe(initialDate);
});
