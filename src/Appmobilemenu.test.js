import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

// Mock other components to simplify testing
jest.mock('./components/TimeGrid', () => () => <div>TimeGrid</div>);
jest.mock('./components/AddAppointmentModal', () => () => null);
jest.mock('./components/Notification', () => () => null);
jest.mock('./components/DashboardHeader', () => () => <div>DashboardHeader</div>);
jest.mock('./components/AppointmentsPanel', () => () => <div>AppointmentsPanel</div>);

// Mock console.log and console.error to reduce noise
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

test('opens mobile menu when toggle button is clicked', async () => {
  render(<App />);
  
  // Mobile menu should not be visible initially
  expect(screen.queryByTestId('mock-mobile-menu')).not.toBeInTheDocument();
  
  // Click the menu toggle button inside act
  await act(async () => {
    fireEvent.click(screen.getByTestId('menu-toggle-button'));
  });
  
  // Mobile menu should now be visible
  expect(screen.getByTestId('mock-mobile-menu')).toBeInTheDocument();
});

test('closes mobile menu when close button is clicked', async () => {
  render(<App />);
  
  // Open the mobile menu
  await act(async () => {
    fireEvent.click(screen.getByTestId('menu-toggle-button'));
  });
  
  // Mobile menu should be visible
  expect(screen.getByTestId('mock-mobile-menu')).toBeInTheDocument();
  
  // Click the close button
  await act(async () => {
    fireEvent.click(screen.getByTestId('close-mobile-menu-button'));
  });
  
  // Mobile menu should be hidden again
  expect(screen.queryByTestId('mock-mobile-menu')).not.toBeInTheDocument();
});
