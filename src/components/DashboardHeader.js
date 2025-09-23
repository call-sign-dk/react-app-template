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

  return (
    <div className="dashboard-header">
      <div className="date-selector">
        <button className="icon-button prev-button" onClick={onPrevDate}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="current-date">
          <div className="calendar-button" onClick={() => setShowCalendar(!showCalendar)}>
            <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
            <h2>{formatWeekRange()}</h2>
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
