import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCalendarAlt, 
  faClock, 
  faPlus, 
  faPencilAlt,
  faTrashAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { formatDateDisplay } from '../utils/timeUtils';
import '../styles/MobileMenu.css';

function MobileMenu({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onPrevDate, 
  onNextDate, 
  appointments, 
  onAddAppointment, 
  onEditAppointment, 
  onDeleteAppointment 
}) {
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <div className="mobile-menu-header">
        <button className="close-menu-button" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="mobile-menu-content">
        <div className="mobile-date-selector">
          <button className="icon-button prev-button" onClick={onPrevDate}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="current-date">
            <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
            <h2>{formatDateDisplay(selectedDate)}</h2>
          </div>
          <button className="icon-button next-button" onClick={onNextDate}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        <div className="mobile-appointments-panel">
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
            {appointments.length === 0 ? (
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
                  <li key={appt.id} className="appointment-card">
                    <div className={`priority-indicator ${appt.priority}`}></div>
                    <div className="appointment-details">
                      <div className="appointment-time">
                        <FontAwesomeIcon icon={faClock} className="time-icon" />
                        {appt.from} - {appt.to}
                      </div>
                      <h4 className="appointment-title">{appt.title}</h4>
                      {appt.description && (
                        <p className="appointment-description">{appt.description}</p>
                      )}
                    </div>
                    <div className="appointment-actions">
                      <button 
                        className="edit-button" 
                        onClick={() => onEditAppointment(appt)}
                        title="Edit appointment"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => onDeleteAppointment(appt.id, appt.date)}
                        title="Delete appointment"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
