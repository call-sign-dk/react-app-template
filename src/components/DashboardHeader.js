import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faChevronLeft, 
  faChevronRight, 
  faChevronDown, 
  faChevronUp, 
  faPlus 
} from '@fortawesome/free-solid-svg-icons';
import { formatDateDisplay } from '../utils/timeUtils';
import Calendar from './Calendar';
import '../styles/DashboardHeader.css';

function DashboardHeader({ 
  selectedDate, 
  onPrevDate, 
  onNextDate, 
  viewMode, 
  onViewModeChange, 
  onAddAppointment,
  showCalendar,
  setShowCalendar,
  setSelectedDate
}) {
  return (
    <div className="dashboard-header">
      <div className="date-selector">
        <button className="icon-button prev-button" onClick={onPrevDate}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="current-date">
          <div className="calendar-button" onClick={() => setShowCalendar(!showCalendar)}>
            <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
            <h2>{formatDateDisplay(selectedDate)}</h2>
            <FontAwesomeIcon 
              icon={showCalendar ? faChevronUp : faChevronDown} 
              className="calendar-toggle-icon" 
            />
          </div>
          {showCalendar && (
            <Calendar 
              selectedDate={selectedDate} 
              setSelectedDate={setSelectedDate}
              showCalendar={showCalendar}
              setShowCalendar={setShowCalendar}
            />
          )}
        </div>
        <button className="icon-button next-button" onClick={onNextDate}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      
      <div className="view-controls">
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
        
        <button 
          className="add-appointment-button" 
          onClick={onAddAppointment}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>New Appointment</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
