import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5022/api', // Adjust this to your .NET API URL
});

// Format date for API (YYYY-MM-DD)
const formatDateForApi = (date) => {
  if (typeof date === 'string') return date;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Convert time string (HH:MM) to full ISO date string
// This function now treats the time as local time without timezone conversion
const timeToIsoString = (dateStr, timeStr) => {
  // Parse the date and time components
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date string in ISO format but without timezone info
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
  
  console.log(`Converting ${dateStr} ${timeStr} to ISO:`, isoString);
  return isoString;
};

// Format appointment for API
const formatAppointmentForApi = (appointment) => {
  const apiAppointment = {
    title: appointment.title,
    description: appointment.description || '',
    startTime: timeToIsoString(appointment.date, appointment.from),
    endTime: timeToIsoString(appointment.date, appointment.to),
    priority: appointment.priority || 'low'
  };
  
  // Include ID if it exists in the appointment
  if (appointment.id) {
    apiAppointment.id = appointment.id;
  }
  
  console.log('Formatting appointment for API:', {
    input: appointment,
    output: apiAppointment
  });
  
  return apiAppointment;
};

// Format appointment from API to frontend format
const formatAppointmentFromApi = (apiAppointment) => {
  // Parse the ISO strings
  const startTimeStr = apiAppointment.startTime;
  const endTimeStr = apiAppointment.endTime;
  
  // Extract date as YYYY-MM-DD from startTime
  const date = startTimeStr.split('T')[0];
  
  // Extract time as HH:MM from the ISO strings
  const from = startTimeStr.split('T')[1].substring(0, 5);
  const to = endTimeStr.split('T')[1].substring(0, 5);
  
  const formattedAppointment = {
    id: apiAppointment.id,
    date,
    from,
    to,
    title: apiAppointment.title,
    description: apiAppointment.description || '',
    priority: apiAppointment.priority || 'low'
  };
  
  console.log('Formatted appointment from API:', {
    input: apiAppointment,
    output: formattedAppointment
  });
  
  return formattedAppointment;
};

// Get appointments for a specific date
export const getAppointments = async (date) => {
  try {
    const formattedDate = formatDateForApi(date);
    console.log('Fetching appointments for date:', formattedDate);
    
    const response = await api.get(`/appointment?date=${formattedDate}`);
    console.log('API response for appointments:', response.data);
    
    // Convert API response to frontend format
    return response.data.map(formatAppointmentFromApi);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const apiAppointment = formatAppointmentForApi(appointmentData);
    console.log('Sending to API (create):', apiAppointment);
    
    const response = await api.post('/appointment', apiAppointment);
    console.log('API response for create:', response.data);
    
    return formatAppointmentFromApi(response.data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Update an existing appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    // Make sure the appointment data includes the ID
    const appointmentWithId = { ...appointmentData, id };
    
    const apiAppointment = formatAppointmentForApi(appointmentWithId);
    
    // Double-check that ID is included
    apiAppointment.id = id;
    
    console.log(`Updating appointment ${id}:`, apiAppointment);
    
    const response = await api.put(`/appointment/${id}`, apiAppointment);
    console.log('API response for update:', response.data);
    
    return formatAppointmentFromApi(response.data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (id) => {
  try {
    console.log(`Deleting appointment ${id}`);
    await api.delete(`/appointment/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export default api;
