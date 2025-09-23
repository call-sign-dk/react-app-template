import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/Calendar.css';

function Calendar({ selectedDate, setSelectedDate, showCalendar, setShowCalendar }) {
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowCalendar]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Create array of days
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null); // Empty cells for days before month starts
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div className="calendar-dropdown-container" ref={calendarRef}>
      <div className="calendar-header">
        <button onClick={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedDate(newDate);
        }}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          {months[currentMonth]} {currentYear}
        </div>
        <button onClick={() => {
          const newDate = new Date(selectedDate);
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedDate(newDate);
        }}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <div className="calendar-days-header">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="empty-day"></div>;
          }
          
          const date = new Date(currentYear, currentMonth, day);
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = selectedDate.toDateString() === date.toDateString();
          
          return (
            <div 
              key={`day-${day}`}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateSelect(date)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
