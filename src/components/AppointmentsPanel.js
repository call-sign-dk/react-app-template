import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPlus } from '@fortawesome/free-solid-svg-icons';
import AppointmentCard from './AppointmentCard';
import '../styles/AppointmentsPanel.css';

function AppointmentsPanel({ appointments, onAddAppointment, onEditAppointment, onDeleteAppointment, loading }) {
  return (
    <div className="appointments-panel">
      <div className="panel-header">
        <h3>
          <FontAwesomeIcon icon={faClock} className="panel-icon" />
          Today's Schedule
        </h3>
        <span className="appointment-count">
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
        </span>
      </div>
      
      <div className="panel-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No appointments scheduled for today</p>
            <button className="quick-add-button" onClick={onAddAppointment}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Schedule Now</span>
            </button>
          </div>
        ) : (
          <ul className="appointments-list">
            {appointments.map((appt) => (
              <AppointmentCard 
                key={appt.id}
                appointment={appt}
                onEdit={onEditAppointment}
                onDelete={onDeleteAppointment}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPanel;
