import React from 'react';
import '../styles/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import AppointmentList from './AppointmentList';

function Sidebar({ date, onPrev, onNext, appointments, onSelectDate }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = months[date.getMonth()];
  
  // Generate years for dropdown (current year ± 5 years)
  const currentYear = date.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  // Generate months for dropdown
  const monthOptions = months.map((month, index) => ({ label: month, value: index }));
  
  const handleYearChange = (e) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(e.target.value));
    onSelectDate(newDate);
  };
  
  const handleMonthChange = (e) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(e.target.value));
    onSelectDate(newDate);
  };
  
  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Appointments</h3>
      
      <div className="date-navigation">
        <button onClick={onPrev} className="nav-button">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="current-month">{currentMonth}</div>
        <button onClick={onNext} className="nav-button">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      
      <div className="calendar-dropdown">
        <div className="dropdown-icon">
          <FontAwesomeIcon icon={faCalendarAlt} />
        </div>
        <select 
          value={date.getMonth()} 
          onChange={handleMonthChange}
          className="month-select"
        >
          {monthOptions.map(month => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        
        <select 
          value={date.getFullYear()} 
          onChange={handleYearChange}
          className="year-select"
        >
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      <div className="appointments-section">
        <h4>Recent & Upcoming Appointments</h4>
        <div className="appointments-container">
          <AppointmentList 
            appointments={appointments} 
            selectedDate={date}
          />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
