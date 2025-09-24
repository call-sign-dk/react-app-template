import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faTimes, 
  faPlus,
  faTrashAlt,
  faEdit
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
  onDeleteAppointment,
  viewMode,
  onViewModeChange
}) {
  // Format the week range for display in week view
  const formatWeekRange = () => {
    if (viewMode !== 'week') return formatDateDisplay(selectedDate);
    
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    // Format: "May 1 - 7, 2023" if same month, or "Apr 30 - May 6, 2023" if different months
    const startMonth = startOfWeek.toLocaleString('en-US', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('en-US', { month: 'short' });
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const year = endOfWeek.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay">
      <div className="mobile-menu">
        <div className="mobile-menu-header">
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2>Appointments</h2>
        </div>
        
        <div className="mobile-date-navigation">
          <button className="nav-button" onClick={onPrevDate}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="current-date">
            {formatWeekRange()}
          </div>
          <button className="nav-button" onClick={onNextDate}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        
        {/* View mode toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => onViewModeChange('day')}
          >
            Day
          </button>
          <button 
            className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => onViewModeChange('week')}
          >
            Week
          </button>
        </div>
        
        <div className="mobile-add-appointment">
          <button className="add-button" onClick={onAddAppointment}>
            <FontAwesomeIcon icon={faPlus} />
            <span>New Appointment</span>
          </button>
        </div>
        
        <div className="mobile-appointments-list">
          <h3>Today's Appointments</h3>
          
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments scheduled for today.</p>
            </div>
          ) : (
            <ul>
              {appointments.map((appointment, index) => (
                <li key={index} className={`appointment-item ${appointment.priority}`}>
                  <div className="appointment-details" onClick={() => onEditAppointment(appointment)}>
                    <div className="appointment-time">{appointment.from} - {appointment.to}</div>
                    <div className="appointment-title">{appointment.title}</div>
                  </div>
                  <div className="appointment-actions">
                    <button 
                      className="edit-button" 
                      onClick={() => onEditAppointment(appointment)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => onDeleteAppointment(appointment.id, appointment.date)}
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
  );
}

export default MobileMenu;
