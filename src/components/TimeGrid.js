import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { formatDateKey, parseTime } from '../utils/timeUtils';
import '../styles/TimeGrid.css';

function TimeGrid({ date, appointments, loading, viewMode = 'day', onEditAppointment, onDateSelect }) {
  // Format date for display
  const formatDateDisplay = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Format date to YYYY-MM-DD for comparison
  const selectedDateKey = formatDateKey(date);
  
  // Get appointments for the selected date
  const todaysAppointments = appointments[selectedDateKey] || [];
  
  // Create array of hours (0-23) - Full 24 hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);
  
  // Format time in 12-hour format with AM/PM
  const formatTime12Hour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };
  
  // Create array of dates for week view
  const getDatesForWeek = () => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };
  
  const weekDates = getDatesForWeek();

  if (loading) {
    return (
      <div className="time-grid-container">
        <div className="time-grid-loading">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Day View
  if (viewMode === 'day') {
    return (
      <div className="time-grid-container">
        <div className="time-grid-header">
          <h3>
            <FontAwesomeIcon icon={faClock} className="header-icon" />
            Daily Schedule
          </h3>
        </div>
        
        <div className="time-grid-content">
          <div className="day-timeline" style={{ position: 'relative' }}>
            {/* Render the hour grid first */}
            {allHours.map(hour => (
              <div key={hour} className="timeline-hour">
                <div className="hour-label">
                  {formatTime12Hour(hour)}
                </div>
                <div className="hour-content">
                  <div className="empty-slot"></div>
                </div>
              </div>
            ))}
            
            {/* Then render all appointments as an overlay */}
            {todaysAppointments.map((appointment, index) => {
              const startMinutes = parseTime(appointment.from);
              const endMinutes = parseTime(appointment.to);
              
              // Calculate position and height based on the entire day (24 hours = 1440 minutes)
              const startPercent = (startMinutes / 1440) * 100;
              const heightPercent = ((endMinutes - startMinutes) / 1440) * 100;
              
              return (
                <div 
                  key={`appt-${index}`}
                  className={`timeline-appointment ${appointment.priority}`}
                  style={{
                    position: 'absolute',
                    top: `${startPercent}%`,
                    height: `${heightPercent}%`,
                    left: '100px', // Position right after hour label - will be overridden by CSS for mobile
                    right: '0', // Extend to the right edge
                    zIndex: 50,
                    boxSizing: 'border-box',
                    padding: '8px',
                    margin: '0 4px' // Small horizontal margin
                  }}
                  title={`${appointment.title} (${appointment.from}-${appointment.to})`}
                  onClick={() => onEditAppointment && onEditAppointment(appointment)}
                >
                  <div className="appointment-content">
                    <div className="appointment-title">{appointment.title}</div>
                    <div className="appointment-time">{appointment.from} - {appointment.to}</div>
                    {appointment.description && (
                      <FontAwesomeIcon icon={faInfoCircle} className="info-icon" title={appointment.description} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  
  // Week View - Modified to use overlay approach for appointments
  return (
    <div className="time-grid-container">
      <div className="time-grid-header">
        <h3>
          <FontAwesomeIcon icon={faClock} className="header-icon" />
          Weekly Schedule
        </h3>
      </div>
      
      <div className="time-grid-content">
        <div className="week-grid">
          {/* Day headers */}
          <div className="week-header">
            <div className="week-hour-label"></div>
            {weekDates.map((day, index) => (
              <div 
                key={index} 
                className={`week-day-header ${formatDateKey(day) === selectedDateKey ? 'current-day' : ''}`}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                {formatDateDisplay(day)}
              </div>
            ))}
          </div>
          
          <div className="week-body" style={{ position: 'relative' }}>
            {/* Hour rows - all 24 hours */}
            {allHours.map(hour => (
              <div key={hour} className="week-hour-row">
                <div className="week-hour-label">
                  {formatTime12Hour(hour)}
                </div>
                
                {/* Day cells - empty cells for the grid */}
                {weekDates.map((day, dayIndex) => {
                  const dayKey = formatDateKey(day);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`week-cell ${dayKey === selectedDateKey ? 'current-day' : ''}`}
                    >
                      <div className="empty-cell"></div>
                    </div>
                  );
                })}
              </div>
            ))}
            
            {/* Render appointments as overlays */}
            {weekDates.map((day, dayIndex) => {
              const dayKey = formatDateKey(day);
              const dayAppointments = appointments[dayKey] || [];
              
              return dayAppointments.map((appointment, apptIndex) => {
                const startMinutes = parseTime(appointment.from);
                const endMinutes = parseTime(appointment.to);
                
                // Calculate position and height based on the entire day (24 hours = 1440 minutes)
                const startPercent = (startMinutes / 1440) * 100;
                const heightPercent = ((endMinutes - startMinutes) / 1440) * 100;
                
                // Calculate horizontal position
                // We need to account for the hour label width and position within the correct day column
                const hourLabelWidth = 100; // Width in pixels - adjust if needed
                const cellWidth = `calc((100% - ${hourLabelWidth}px) / ${weekDates.length})`;
                
                return (
                  <div 
                    key={`${dayKey}-${apptIndex}`}
                    className={`week-appointment-overlay ${appointment.priority}`}
                    style={{
                      position: 'absolute',
                      top: `${startPercent}%`,
                      height: `${heightPercent}%`,
                      left: `calc(${hourLabelWidth}px + (${dayIndex} * ${cellWidth}))`,
                      width: `calc(${cellWidth} - 2px)`, // Adjusted width to fit better in cell
                      zIndex: 50,
                      boxSizing: 'border-box',
                      padding: '8px',
                      margin: '0 1px' // Smaller margin for better alignment
                    }}
                    title={`${appointment.title} (${appointment.from}-${appointment.to})`}
                    onClick={() => onEditAppointment && onEditAppointment(appointment)}
                  >
                    <div className="appointment-content">
                      <div className="appointment-title">{appointment.title}</div>
                      <div className="appointment-time">{appointment.from} - {appointment.to}</div>
                      {appointment.description && (
                        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" title={appointment.description} />
                      )}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeGrid;
