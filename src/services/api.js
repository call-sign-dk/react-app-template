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
const timeToIsoString = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

// Format appointment for API
const formatAppointmentForApi = (appointment) => {
  return {
    title: appointment.title,
    description: appointment.description || '',
    startTime: timeToIsoString(appointment.date, appointment.from),
    endTime: timeToIsoString(appointment.date, appointment.to),
    priority: appointment.priority || 'low' // Include priority as string
  };
};

// Format appointment from API to frontend format
const formatAppointmentFromApi = (apiAppointment) => {
  const startDate = new Date(apiAppointment.startTime);
  const endDate = new Date(apiAppointment.endTime);
  
  return {
    id: apiAppointment.id,
    date: startDate.toISOString().split('T')[0],
    from: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
    to: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
    title: apiAppointment.title,
    description: apiAppointment.description || '',
    priority: apiAppointment.priority || 'low' // Use the priority from API
  };
};

// Get appointments for a specific date
export const getAppointments = async (date) => {
  try {
    const formattedDate = formatDateForApi(date);
    const response = await api.get(`/appointment?date=${formattedDate}`);
    
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
    console.log('Sending to API:', apiAppointment); // Log what you're sending
    const response = await api.post('/appointment', apiAppointment);
    
    return formatAppointmentFromApi(response.data);
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Add this function to your existing api.js file

// Update an existing appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const apiAppointment = formatAppointmentForApi(appointmentData);
    apiAppointment.id = id; // Make sure ID is included
    
    console.log('Updating appointment:', apiAppointment); // Log what you're sending
    const response = await api.put(`/appointment/${id}`, apiAppointment);
    
    return formatAppointmentFromApi(response.data);
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};


// Delete an appointment
export const deleteAppointment = async (id) => {
  try {
    await api.delete(`/appointment/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export default api;
