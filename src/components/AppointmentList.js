import React from 'react';
import '../styles/AppointmentList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

function AppointmentList({ appointments, selectedDate }) {
  // Format date to YYYY-MM-DD for comparison
  const formatDateKey = (date) => date.toISOString().substring(0, 10);
  const selectedDateKey = formatDateKey(selectedDate);
  
  // Filter appointments for the selected date
  const todaysAppointments = appointments[selectedDateKey] || [];
  
  // Sort appointments by time
  const sortedAppointments = [...todaysAppointments].sort((a, b) => {
    return a.from.localeCompare(b.from);
  });

  return (
    <div className="appointment-list">
      {sortedAppointments.length === 0 ? (
        <p className="no-appointments">No appointments for today</p>
      ) : (
        <ul>
          {sortedAppointments.map((appointment, index) => (
            <li key={index} className={`appointment-item ${appointment.priority}`}>
              <div className="appointment-time">
                <FontAwesomeIcon icon={faClock} />
                <span>{appointment.from} - {appointment.to}</span>
              </div>
              <div className="appointment-title">{appointment.title}</div>
              <div className="appointment-description">{appointment.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AppointmentList;
