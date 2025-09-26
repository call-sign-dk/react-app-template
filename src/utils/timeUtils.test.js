import {
  createDateTimeFromStrings,
  formatTimeFrom24Hour,
  formatDateString,
  parseTimeToMinutes,
  formatMinutesToTime,
  formatDateKey,
  formatDateDisplay,
  formatLocalDate,
  parseTime
} from './timeUtils';

describe('Time Utilities', () => {
  describe('createDateTimeFromStrings', () => {
    test('creates a Date object from date and time strings', () => {
      const date = createDateTimeFromStrings('2023-05-15', '14:30');
      
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(4); // May is 4 (0-indexed)
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(0);
    });

    test('handles single-digit values correctly', () => {
      const date = createDateTimeFromStrings('2023-1-5', '9:5');
      
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(5);
      expect(date.getHours()).toBe(9);
      expect(date.getMinutes()).toBe(5);
    });
  });

  describe('formatTimeFrom24Hour', () => {
    test('formats a Date object to 24-hour time string', () => {
      const date = new Date(2023, 4, 15, 14, 30, 0);
      const timeString = formatTimeFrom24Hour(date);
      
      expect(timeString).toBe('14:30');
    });

    test('pads hours and minutes with leading zeros', () => {
      const date = new Date(2023, 4, 15, 9, 5, 0);
      const timeString = formatTimeFrom24Hour(date);
      
      expect(timeString).toBe('09:05');
    });
  });

  describe('formatDateString', () => {
    test('formats a Date object to YYYY-MM-DD string', () => {
      const date = new Date(2023, 4, 15);
      const dateString = formatDateString(date);
      
      expect(dateString).toBe('2023-05-15');
    });
  });

  describe('parseTimeToMinutes', () => {
    test('converts time string to minutes since midnight', () => {
      expect(parseTimeToMinutes('00:00')).toBe(0);
      expect(parseTimeToMinutes('01:30')).toBe(90);
      expect(parseTimeToMinutes('14:45')).toBe(885);
      expect(parseTimeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('formatMinutesToTime', () => {
    test('converts minutes since midnight to time string', () => {
      expect(formatMinutesToTime(0)).toBe('00:00');
      expect(formatMinutesToTime(90)).toBe('01:30');
      expect(formatMinutesToTime(885)).toBe('14:45');
      expect(formatMinutesToTime(1439)).toBe('23:59');
    });
  });

  describe('formatDateKey', () => {
    test('formats Date object to YYYY-MM-DD for use as object keys', () => {
      const date = new Date(2023, 4, 15);
      expect(formatDateKey(date)).toBe('2023-05-15');
    });

    test('returns string date as is', () => {
      expect(formatDateKey('2023-05-15')).toBe('2023-05-15');
    });
  });

  describe('formatDateDisplay', () => {
    test('formats date for display in UI', () => {
      const date = new Date(2023, 4, 15); // May 15, 2023
      const displayDate = formatDateDisplay(date);
      
      // This will depend on the locale, but for en-US it should be like "Monday, May 15"
      expect(displayDate).toContain('May 15');
    });
  });

  describe('formatLocalDate', () => {
    test('formats date to avoid timezone issues', () => {
      const date = new Date(2023, 4, 15);
      expect(formatLocalDate(date)).toBe('2023-05-15');
    });

    test('returns current date string when no date provided', () => {
      // Mock the current date
      const originalDate = global.Date;
      const mockDate = new Date(2023, 4, 15);
      global.Date = class extends Date {
        constructor() {
          return mockDate;
        }
      };
      
      expect(formatLocalDate()).toBe('2023-05-15');
      
      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('parseTime', () => {
    test('parses time string to minutes for comparison', () => {
      expect(parseTime('00:00')).toBe(0);
      expect(parseTime('01:30')).toBe(90);
      expect(parseTime('14:45')).toBe(885);
      expect(parseTime('23:59')).toBe(1439);
    });
  });

  // Test edge cases and integration between functions
  describe('Integration and edge cases', () => {
    test('round trip: formatMinutesToTime and parseTimeToMinutes', () => {
      const minutes = 885; // 14:45
      const timeString = formatMinutesToTime(minutes);
      const backToMinutes = parseTimeToMinutes(timeString);
      
      expect(timeString).toBe('14:45');
      expect(backToMinutes).toBe(minutes);
    });

    test('round trip: formatDateString and createDateTimeFromStrings', () => {
      const originalDate = new Date(2023, 4, 15, 14, 30);
      const dateString = formatDateString(originalDate);
      const timeString = formatTimeFrom24Hour(originalDate);
      const recreatedDate = createDateTimeFromStrings(dateString, timeString);
      
      expect(dateString).toBe('2023-05-15');
      expect(timeString).toBe('14:30');
      expect(recreatedDate.getFullYear()).toBe(originalDate.getFullYear());
      expect(recreatedDate.getMonth()).toBe(originalDate.getMonth());
      expect(recreatedDate.getDate()).toBe(originalDate.getDate());
      expect(recreatedDate.getHours()).toBe(originalDate.getHours());
      expect(recreatedDate.getMinutes()).toBe(originalDate.getMinutes());
    });
  });
});
