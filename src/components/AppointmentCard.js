import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/AppointmentCard.css';

function AppointmentCard({ appointment, onEdit, onDelete }) {
  return (
    <li className="appointment-card">
      <div className={`priority-indicator ${appointment.priority}`}></div>
      <div className="appointment-details">
        <div className="appointment-time">
          <FontAwesomeIcon icon={faClock} className="time-icon" />
          {appointment.from} - {appointment.to}
        </div>
        <h4 className="appointment-title">{appointment.title}</h4>
        {appointment.description && (
          <p className="appointment-description">{appointment.description}</p>
        )}
      </div>
      <div className="appointment-actions">
        <button 
          className="edit-button" 
          onClick={() => onEdit(appointment)}
          title="Edit appointment"
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
        <button 
          className="delete-button" 
          onClick={() => onDelete(appointment.id, appointment.date)}
          title="Delete appointment"
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
    </li>
  );
}

export default AppointmentCard;
