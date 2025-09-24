import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5022/api', // Adjust this to your .NET API URL
});

// Cache for storing appointments
let appointmentsCache = {
  data: {},  // Object where keys are month-year strings (MM-YYYY) and values are appointment objects by date
  lastFetched: {} // Object to track when each month was last fetched
};

// Format date for API (YYYY-MM-DD)
const formatDateForApi = (date) => {
  if (typeof date === 'string') return date;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Get first and last day of a month
const getMonthDateRange = (year, month) => {
  // Month is 0-indexed in JavaScript Date
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  return {
    start: formatDateForApi(startDate),
    end: formatDateForApi(endDate)
  };
};

// Get a cache key for a month (MM-YYYY format)
const getMonthCacheKey = (date) => {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

// Convert time string (HH:MM) to full ISO date string
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

// Fetch appointments for a specific month and store in cache
const fetchMonthAppointments = async (year, month) => {
  const monthCacheKey = `${String(month + 1).padStart(2, '0')}-${year}`;
  
  // Check if we need to refresh the cache (older than 5 minutes)
  const shouldRefreshCache = 
    !appointmentsCache.data[monthCacheKey] ||
    !appointmentsCache.lastFetched[monthCacheKey] || 
    (new Date() - appointmentsCache.lastFetched[monthCacheKey]) > 5 * 60 * 1000;
  
  if (shouldRefreshCache) {
    const { start, end } = getMonthDateRange(year, month);
    
    console.log(`Fetching appointments for month: ${year}-${month + 1} (${start} to ${end})`);
    
    try {
      // Fetch appointments for this month from the API
      // We'll use the first day of the month as the date parameter
      const response = await api.get(`/appointment?date=${start}`);
      console.log('API response for month appointments:', response.data);
      
      // Convert API response to frontend format
      const formattedAppointments = response.data.map(formatAppointmentFromApi);
      
      // Group appointments by date
      const appointmentsByDate = {};
      formattedAppointments.forEach(appointment => {
        if (!appointmentsByDate[appointment.date]) {
          appointmentsByDate[appointment.date] = [];
        }
        appointmentsByDate[appointment.date].push(appointment);
      });
      
      // Update cache
      appointmentsCache.data[monthCacheKey] = appointmentsByDate;
      appointmentsCache.lastFetched[monthCacheKey] = new Date();
    } catch (error) {
      console.error(`Error fetching appointments for month ${year}-${month + 1}:`, error);
      // Initialize with empty data if fetch fails
      appointmentsCache.data[monthCacheKey] = {};
      appointmentsCache.lastFetched[monthCacheKey] = new Date();
    }
  } else {
    console.log(`Using cached appointments for month: ${year}-${month + 1}`);
  }
  
  return appointmentsCache.data[monthCacheKey] || {};
};

// Fetch appointments for current month plus previous and next months
export const fetchSurroundingMonths = async (date = new Date()) => {
  const currentDate = new Date(date);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Calculate previous and next months
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  console.log(`Fetching appointments for surrounding months: ${prevYear}-${prevMonth + 1}, ${currentYear}-${currentMonth + 1}, ${nextYear}-${nextMonth + 1}`);
  
  // Fetch appointments for all three months in parallel
  await Promise.all([
    fetchMonthAppointments(prevYear, prevMonth),
    fetchMonthAppointments(currentYear, currentMonth),
    fetchMonthAppointments(nextYear, nextMonth)
  ]);
  
  // Return all cached data
  return appointmentsCache.data;
};

// Get appointments for a specific date (from cache if available)
export const getAppointments = async (date) => {
  try {
    const requestDate = new Date(date);
    const formattedDate = formatDateForApi(requestDate);
    const year = requestDate.getFullYear();
    const month = requestDate.getMonth();
    const monthCacheKey = getMonthCacheKey(requestDate);
    
    // Check if we need to fetch data for this month and surrounding months
    const shouldFetchMonth = 
      !appointmentsCache.data[monthCacheKey] ||
      !appointmentsCache.lastFetched[monthCacheKey] || 
      (new Date() - appointmentsCache.lastFetched[monthCacheKey]) > 5 * 60 * 1000;
    
    if (shouldFetchMonth) {
      // If we need to fetch this month, also fetch surrounding months
      await fetchSurroundingMonths(requestDate);
    }
    
    // Return appointments for the requested date from the cache
    const monthData = appointmentsCache.data[monthCacheKey] || {};
    const dateAppointments = monthData[formattedDate] || [];
    
    console.log(`Returning ${dateAppointments.length} appointments for ${formattedDate} from cache`);
    return dateAppointments;
  } catch (error) {
    console.error('Error getting appointments for date:', error);
    throw error;
  }
};

// Get appointments for a date range (e.g., week view)
export const getAppointmentsForRange = async (startDate, endDate) => {
  try {
    // Convert to Date objects if they're strings
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if we need to fetch data for the months in this range
    const startMonthKey = getMonthCacheKey(start);
    const endMonthKey = getMonthCacheKey(end);
    
    const shouldFetchStartMonth = 
      !appointmentsCache.data[startMonthKey] ||
      !appointmentsCache.lastFetched[startMonthKey] || 
      (new Date() - appointmentsCache.lastFetched[startMonthKey]) > 5 * 60 * 1000;
    
    const shouldFetchEndMonth = 
      startMonthKey !== endMonthKey && (
        !appointmentsCache.data[endMonthKey] ||
        !appointmentsCache.lastFetched[endMonthKey] || 
        (new Date() - appointmentsCache.lastFetched[endMonthKey]) > 5 * 60 * 1000
      );
    
    // Fetch data for start month and surrounding months if needed
    if (shouldFetchStartMonth) {
      await fetchSurroundingMonths(start);
    }
    
    // If end month is different and needs fetching, fetch it and its surrounding months
    if (shouldFetchEndMonth) {
      await fetchSurroundingMonths(end);
    }
    
    // Collect all appointments within the date range
    const rangeAppointments = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateKey = formatDateForApi(currentDate);
      const monthKey = getMonthCacheKey(currentDate);
      
      if (appointmentsCache.data[monthKey] && appointmentsCache.data[monthKey][dateKey]) {
        rangeAppointments.push(...appointmentsCache.data[monthKey][dateKey]);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Returning ${rangeAppointments.length} appointments for date range`);
    return rangeAppointments;
  } catch (error) {
    console.error('Error getting appointments for range:', error);
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
    
    const newAppointment = formatAppointmentFromApi(response.data);
    
    // Update the cache if we have data for this month
    const monthCacheKey = getMonthCacheKey(new Date(newAppointment.date));
    if (appointmentsCache.data[monthCacheKey]) {
      if (!appointmentsCache.data[monthCacheKey][newAppointment.date]) {
        appointmentsCache.data[monthCacheKey][newAppointment.date] = [];
      }
      appointmentsCache.data[monthCacheKey][newAppointment.date].push(newAppointment);
    }
    
    return newAppointment;
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
    
    const updatedAppointment = formatAppointmentFromApi(response.data);
    
    // Update the appointment in the cache
    // First, remove the old appointment from all caches (since we don't know which month it was in)
    Object.keys(appointmentsCache.data).forEach(monthKey => {
      Object.keys(appointmentsCache.data[monthKey] || {}).forEach(dateKey => {
        if (appointmentsCache.data[monthKey][dateKey]) {
          appointmentsCache.data[monthKey][dateKey] = 
            appointmentsCache.data[monthKey][dateKey].filter(a => a.id !== id);
        }
      });
    });
    
    // Then add the updated appointment to the correct month/date
    const monthCacheKey = getMonthCacheKey(new Date(updatedAppointment.date));
    if (appointmentsCache.data[monthCacheKey]) {
      if (!appointmentsCache.data[monthCacheKey][updatedAppointment.date]) {
        appointmentsCache.data[monthCacheKey][updatedAppointment.date] = [];
      }
      appointmentsCache.data[monthCacheKey][updatedAppointment.date].push(updatedAppointment);
    }
    
    return updatedAppointment;
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
    
    // Remove the appointment from all caches
    Object.keys(appointmentsCache.data).forEach(monthKey => {
      Object.keys(appointmentsCache.data[monthKey] || {}).forEach(dateKey => {
        if (appointmentsCache.data[monthKey][dateKey]) {
          appointmentsCache.data[monthKey][dateKey] = 
            appointmentsCache.data[monthKey][dateKey].filter(a => a.id !== id);
        }
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

export default api;
