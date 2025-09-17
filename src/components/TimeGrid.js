import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/TimeGrid.css';

function TimeGrid({ date, appointments, loading, viewMode = 'day' }) {
  // Format date for display
  const formatDateDisplay = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Helper function to parse time string to minutes
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // Format date to YYYY-MM-DD for comparison
  const formatDateKey = (date) => date.toISOString().substring(0, 10);
  const selectedDateKey = formatDateKey(date);
  
  // Get appointments for the selected date
  const todaysAppointments = appointments[selectedDateKey] || [];
  
  // Create array of hours (8 AM to 8 PM by default)
  const businessHours = Array.from({ length: 13 }, (_, i) => i + 8);
  
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
          <div className="day-timeline">
            {businessHours.map(hour => {
              // Find appointments that overlap with this hour
              const hourAppointments = todaysAppointments.filter(appointment => {
                const startMinutes = parseTime(appointment.from);
                const endMinutes = parseTime(appointment.to);
                const hourStartMinutes = hour * 60;
                const hourEndMinutes = (hour + 1) * 60;
                
                // Check if appointment overlaps with this hour
                return (
                  (startMinutes >= hourStartMinutes && startMinutes < hourEndMinutes) ||
                  (endMinutes > hourStartMinutes && endMinutes <= hourEndMinutes) ||
                  (startMinutes <= hourStartMinutes && endMinutes >= hourEndMinutes)
                );
              });
              
              return (
                <div key={hour} className="timeline-hour">
                  <div className="hour-label">
                    {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>
                  <div className="hour-content">
                    {hourAppointments.length === 0 ? (
                      <div className="empty-slot"></div>
                    ) : (
                      hourAppointments.map((appointment, index) => {
                        const startMinutes = parseTime(appointment.from);
                        const endMinutes = parseTime(appointment.to);
                        const hourStartMinutes = hour * 60;
                        const hourEndMinutes = (hour + 1) * 60;
                        
                        // Calculate position and height within the hour
                        const start = Math.max(startMinutes, hourStartMinutes);
                        const end = Math.min(endMinutes, hourEndMinutes);
                        const startPercent = ((start - hourStartMinutes) / 60) * 100;
                        const heightPercent = ((end - start) / 60) * 100;
                        
                        // Only show appointment details if it starts in this hour
                        const showDetails = startMinutes >= hourStartMinutes && startMinutes < hourEndMinutes;
                        
                        return (
                          <div 
                            key={index}
                            className={`timeline-appointment ${appointment.priority}`}
                            style={{
                              top: `${startPercent}%`,
                              height: `${heightPercent}%`
                            }}
                            title={`${appointment.title} (${appointment.from}-${appointment.to})`}
                          >
                            {showDetails && (
                              <div className="appointment-content">
                                <div className="appointment-title">{appointment.title}</div>
                                <div className="appointment-time">{appointment.from} - {appointment.to}</div>
                                {appointment.description && (
                                  <FontAwesomeIcon icon={faInfoCircle} className="info-icon" title={appointment.description} />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
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
  
  // Week View
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
              >
                {formatDateDisplay(day)}
              </div>
            ))}
          </div>
          
          {/* Hour rows */}
          {businessHours.map(hour => (
            <div key={hour} className="week-hour-row">
              <div className="week-hour-label">
                {hour % 12 === 0 ? 12 : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
              </div>
              
              {/* Day cells */}
              {weekDates.map((day, dayIndex) => {
                const dayKey = formatDateKey(day);
                const dayAppointments = appointments[dayKey] || [];
                
                // Find appointments for this hour and day
                const hourAppointments = dayAppointments.filter(appointment => {
                  const startMinutes = parseTime(appointment.from);
                  const endMinutes = parseTime(appointment.to);
                  const hourStartMinutes = hour * 60;
                  const hourEndMinutes = (hour + 1) * 60;
                  
                  return (
                    (startMinutes >= hourStartMinutes && startMinutes < hourEndMinutes) ||
                    (endMinutes > hourStartMinutes && endMinutes <= hourEndMinutes) ||
                    (startMinutes <= hourStartMinutes && endMinutes >= hourEndMinutes)
                  );
                });
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`week-cell ${dayKey === selectedDateKey ? 'current-day' : ''}`}
                  >
                    {hourAppointments.length > 0 ? (
                      <div className="week-cell-appointments">
                        {hourAppointments.map((appointment, index) => (
                          <div 
                            key={index}
                            className={`week-appointment ${appointment.priority}`}
                            title={`${appointment.title} (${appointment.from}-${appointment.to})`}
                          >
                            <div className="week-appointment-title">{appointment.title}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-cell"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimeGrid;
