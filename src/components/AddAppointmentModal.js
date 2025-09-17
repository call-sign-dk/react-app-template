import React, { useState, useEffect, useRef } from 'react';
import '../styles/AddAppointmentModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faClock } from '@fortawesome/free-solid-svg-icons';

function AddAppointmentModal({ onClose, onSave, defaultDate }) {
  const [mode, setMode] = useState('today'); // 'today' or 'later'
  const [date, setDate] = useState(defaultDate.toISOString().substring(0, 10));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('low');
  const [timeError, setTimeError] = useState('');
  const [formErrors, setFormErrors] = useState({
    title: false,
    desc: false,
    from: false,
    to: false
  });
  
  // Refs for the time inputs
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  // Validate time whenever from or to changes
  useEffect(() => {
    if (from && to) {
      const fromMinutes = parseTime(from);
      const toMinutes = parseTime(to);
      
      if (toMinutes <= fromMinutes) {
        setTimeError('End time must be after start time');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [from, to]);

  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const duration = from && to && !timeError ? Math.max(parseTime(to) - parseTime(from), 0) : 0;

  const validateForm = () => {
    const errors = {
      title: !title.trim(),
      desc: !desc.trim(),
      from: !from,
      to: !to
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (timeError) {
      return;
    }

    const appointment = {
      date: date,
      from,
      to,
      title,
      description: desc,
      priority,
    };

    onSave(appointment);
    onClose();
  };

  // Handle start time change
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    
    // Clear any previous end time if it's now invalid
    if (to && parseTime(to) <= parseTime(value)) {
      setTo('');
    }
    
    // Force blur to close the dropdown
    setTimeout(() => {
      e.target.blur();
      
      // If end time is empty, focus it next
      if (!to && toInputRef.current) {
        toInputRef.current.focus();
      }
    }, 100);
  };

  // Handle end time change
  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    
    // Force blur to close the dropdown
    setTimeout(() => {
      e.target.blur();
    }, 100);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Appointment</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-section button-row">
          <button
            className={mode === 'today' ? 'active' : ''}
            onClick={() => {
              setMode('today');
              setDate(defaultDate.toISOString().substring(0, 10));
            }}
          >
            Schedule Today
          </button>
          <button
            className={mode === 'later' ? 'active' : ''}
            onClick={() => setMode('later')}
          >
            Schedule Later
          </button>
        </div>

        <div className="form-group">
          <label>Date</label>
          {mode === 'today' ? (
            <input type="text" value={date} readOnly disabled />
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>

        <div className="time-inputs-container">
          <div className="form-group time-input">
            <label className="time-label">
              <FontAwesomeIcon icon={faClock} className="time-icon" />
              Start Time <span className="required">*</span>
            </label>
            <input
              ref={fromInputRef}
              type="time"
              value={from}
              onChange={handleFromChange}
              className={formErrors.from ? 'error' : ''}
            />
            {formErrors.from && <div className="error-message">Start time is required</div>}
          </div>

          <div className="form-group time-input">
            <label className="time-label">
              <FontAwesomeIcon icon={faClock} className="time-icon" />
              End Time <span className="required">*</span>
            </label>
            <input
              ref={toInputRef}
              type="time"
              value={to}
              onChange={handleToChange}
              disabled={!from}
              className={formErrors.to ? 'error' : ''}
            />
            {formErrors.to && <div className="error-message">End time is required</div>}
          </div>
        </div>

        {timeError && (
          <div className="error-message time-error">
            <FontAwesomeIcon icon={faExclamationTriangle} /> {timeError}
          </div>
        )}

        {duration > 0 && (
          <div className="duration-display">
            Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        )}

        <div className="form-group">
          <label>Title <span className="required">*</span></label>
          <input
            type="text"
            placeholder="e.g., Team Meeting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formErrors.title ? 'error' : ''}
          />
          {formErrors.title && <div className="error-message">Title is required</div>}
        </div>

        <div className="form-group">
          <label>Description <span className="required">*</span></label>
          <textarea
            placeholder="Add details about your appointment"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className={formErrors.desc ? 'error' : ''}
          />
          {formErrors.desc && <div className="error-message">Description is required</div>}
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low (Green)</option>
            <option value="medium">Medium (Orange)</option>
            <option value="high">High (Red)</option>
          </select>
        </div>

        <div className="modal-actions">
          <button 
            onClick={handleSave}
            disabled={timeError !== ''}
            className={timeError ? 'disabled' : ''}
          >
            Book Appointment
          </button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
