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
    endTime: timeToIsoString(appointment.date, appointment.to)
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
    priority: 'low' // Default since your backend doesn't have priority
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
    const response = await api.post('/appointment', apiAppointment);
    
    return formatAppointmentFromApi(response.data);
  } catch (error) {
    console.error('Error creating appointment:', error);
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
