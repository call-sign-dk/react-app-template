import React from 'react';
import '../styles/TimeGrid.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function TimeGrid({ date, appointments }) {
  // Format date to display full day, date, month, year
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create 24 hour slots
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
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

  return (
    <div className="time-grid-container">
      <div className="time-grid-header">
        <h2>{formattedDate}</h2>
      </div>
      
      <div className="timeline-view">
        {hours.map(hour => {
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
                {hour.toString().padStart(2, '0')}:00
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
                        className={`appointment-block ${appointment.priority}`}
                        style={{
                          top: `${startPercent}%`,
                          height: `${heightPercent}%`
                        }}
                        title={`${appointment.title} (${appointment.from}-${appointment.to})`}
                      >
                        {showDetails && (
                          <div className="appointment-info">
                            <span className="appointment-title">{appointment.title}</span>
                            <span className="appointment-time">{appointment.from}-{appointment.to}</span>
                            <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
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
  );
}

export default TimeGrid;
