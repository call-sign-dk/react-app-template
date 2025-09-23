/**
 * Converts a time string in 24-hour format (HH:MM) to a Date object
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format (24-hour)
 * @returns {Date} - JavaScript Date object
 */
export const createDateTimeFromStrings = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date in local timezone
  return new Date(year, month - 1, day, hours, minutes, 0);
};

/**
 * Formats a Date object to a time string in 24-hour format (HH:MM)
 * @param {Date} date - JavaScript Date object
 * @returns {string} - Time string in HH:MM format
 */
export const formatTimeFrom24Hour = (date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Formats a Date object to a date string in YYYY-MM-DD format
 * @param {Date} date - JavaScript Date object
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateString = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Parses a time string in HH:MM format to minutes since midnight
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} - Minutes since midnight
 */
export const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Formats minutes since midnight to a time string in HH:MM format
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Time string in HH:MM format
 */
export const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format date to YYYY-MM-DD for use as object keys
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateKey = (date) => {
  if (typeof date === 'string') return date;
  
  // Create a date string that preserves the local date regardless of timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display in header and other UI elements
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string for display
 */
export const formatDateDisplay = (date) => {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format local date to avoid timezone issues
 * @param {Date} dateObj - The date object to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatLocalDate = (dateObj) => {
  if (!dateObj) return new Date().toISOString().substring(0, 10);
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse time string to minutes for comparison
 * @param {string} timeStr - Time string in format "HH:MM"
 * @returns {number} Total minutes
 */
export const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};
