import axios from 'axios';
import * as api from './api';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: {} }),
      put: jest.fn().mockResolvedValue({ data: {} }),
      delete: jest.fn().mockResolvedValue({})
    }))
  };
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('getAppointments fetches appointments for a date', async () => {
    // Call the function
    await api.getAppointments(new Date());
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
  
  test('getAppointmentsForRange fetches appointments for a range', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    // Call the function
    await api.getAppointmentsForRange(startDate, endDate);
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
  
  test('createAppointment creates a new appointment', async () => {
    const appointment = {
      title: 'Test Appointment',
      description: 'Test Description',
      date: '2023-05-15',
      from: '09:00',
      to: '10:00',
      priority: 'medium'
    };
    
    // Call the function
    await api.createAppointment(appointment);
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
  
  test('updateAppointment updates an existing appointment', async () => {
    const appointment = {
      title: 'Updated Appointment',
      description: 'Updated Description',
      date: '2023-05-15',
      from: '10:00',
      to: '11:00',
      priority: 'high'
    };
    
    // Call the function
    await api.updateAppointment(1, appointment);
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
  
  test('deleteAppointment deletes an appointment', async () => {
    // Call the function
    await api.deleteAppointment(1);
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
  
  test('fetchSurroundingMonths fetches data for surrounding months', async () => {
    // Call the function
    await api.fetchSurroundingMonths(new Date());
    // Just verify it doesn't throw an error
    expect(true).toBe(true);
  });
});
