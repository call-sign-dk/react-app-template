import React, { useState } from 'react';
import '../styles/CustomTimePicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function CustomTimePicker({ value, onChange, disabled, label, isStart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSelection, setActiveSelection] = useState('hour'); // 'hour' or 'minute'
  
  // Parse the current value
  const parseTimeValue = () => {
    if (!value) return { hour: 9, minute: 0 }; // Default to 9:00 AM
    
    const [hour, minute] = value.split(':').map(Number);
    return { hour, minute };
  };
  
  const { hour, minute } = parseTimeValue();
  
  // Format for display
  const formatTime = (h, m) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  // Handle hour selection
  const selectHour = (h) => {
    onChange(formatTime(h, minute));
    setActiveSelection('minute');
  };
  
  // Handle minute selection
  const selectMinute = (m) => {
    onChange(formatTime(hour, m));
    setIsOpen(false);
  };
  
  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Generate minutes (0, 15, 30, 45)
  const minutes = [0, 15, 30, 45];
  
  return (
    <div className="custom-time-picker">
      <label className={`time-label ${isStart ? 'start-time' : 'end-time'}`}>
        {label} <span className="required">*</span>
      </label>
      
      <div className="time-input-container">
        <div 
          className={`time-input ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {value ? formatTime(hour, minute) : 'Select time'}
          <FontAwesomeIcon 
            icon={isOpen ? faChevronUp : faChevronDown} 
            className="dropdown-icon"
          />
        </div>
        
        {isOpen && !disabled && (
          <div className="time-dropdown">
            <div className="time-dropdown-header">
              <button 
                className={activeSelection === 'hour' ? 'active' : ''}
                onClick={() => setActiveSelection('hour')}
              >
                Hour
              </button>
              <button 
                className={activeSelection === 'minute' ? 'active' : ''}
                onClick={() => setActiveSelection('minute')}
              >
                Minute
              </button>
            </div>
            
            <div className="time-options">
              {activeSelection === 'hour' ? (
                <div className="hour-grid">
                  {hours.map(h => (
                    <button 
                      key={h} 
                      className={h === hour ? 'selected' : ''}
                      onClick={() => selectHour(h)}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="minute-grid">
                  {minutes.map(m => (
                    <button 
                      key={m} 
                      className={m === minute ? 'selected' : ''}
                      onClick={() => selectMinute(m)}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomTimePicker;
