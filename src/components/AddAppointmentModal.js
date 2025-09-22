import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faClock, faTag, faAlignLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import '../styles/AddAppointmentModal.css';
import CustomTimePicker from './CustomTimePicker';

function AddAppointmentModal({ onClose, onSave, defaultDate, editingAppointment = null }) {
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

  // If we're editing, populate the form with appointment data
  useEffect(() => {
    if (editingAppointment) {
      setTitle(editingAppointment.title);
      setDesc(editingAppointment.description || '');
      setDate(editingAppointment.date);
      setFrom(editingAppointment.from);
      setTo(editingAppointment.to);
      setPriority(editingAppointment.priority || 'low');
      
      // If editing an appointment for a different day, switch to "later" mode
      if (editingAppointment.date !== defaultDate.toISOString().substring(0, 10)) {
        setMode('later');
      }
    }
  }, [editingAppointment, defaultDate]);

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

    // If editing, include the ID
    if (editingAppointment) {
      appointment.id = editingAppointment.id;
    }

    onSave(appointment);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} className="modal-icon" />
            {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${mode === 'today' ? 'active' : ''}`}
            onClick={() => {
              setMode('today');
              setDate(defaultDate.toISOString().substring(0, 10));
            }}
          >
            Schedule Today
          </button>
          <button
            className={`tab-button ${mode === 'later' ? 'active' : ''}`}
            onClick={() => setMode('later')}
          >
            Schedule Later
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faCalendarAlt} className="field-icon" />
              Date <span className="required">*</span>
            </label>
            {mode === 'today' ? (
              <div className="date-display">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            ) : (
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            )}
          </div>

          <div className="time-inputs">
            <div className="form-group">
              <CustomTimePicker
                value={from}
                onChange={setFrom}
                disabled={false}
                label="Start Time"
                isStart={true}
              />
              {formErrors.from && <div className="error-message">Start time is required</div>}
            </div>

            <div className="form-group">
              <CustomTimePicker
                value={to}
                onChange={setTo}
                disabled={!from}
                label="End Time"
                isStart={false}
              />
              {formErrors.to && <div className="error-message">End time is required</div>}
            </div>
          </div>

          {timeError && (
            <div className="time-error">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {timeError}
            </div>
          )}

          {duration > 0 && (
            <div className="duration-display">
              <FontAwesomeIcon icon={faClock} className="duration-icon" />
              Duration: {Math.floor(duration / 60)}h {duration % 60}m
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faTag} className="field-icon" />
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${formErrors.title ? 'error' : ''}`}
              placeholder="e.g., Team Meeting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {formErrors.title && <div className="error-message">Title is required</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faAlignLeft} className="field-icon" />
              Description <span className="required">*</span>
            </label>
            <textarea
              className={`form-textarea ${formErrors.desc ? 'error' : ''}`}
              placeholder="Add details about your appointment"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
            />
            {formErrors.desc && <div className="error-message">Description is required</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-options">
              <label className={`priority-option ${priority === 'low' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={priority === 'low'}
                  onChange={() => setPriority('low')}
                />
                <span className="priority-color low"></span>
                <span>Low</span>
              </label>
              
              <label className={`priority-option ${priority === 'medium' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={priority === 'medium'}
                  onChange={() => setPriority('medium')}
                />
                <span className="priority-color medium"></span>
                <span>Medium</span>
              </label>
              
              <label className={`priority-option ${priority === 'high' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={priority === 'high'}
                  onChange={() => setPriority('high')}
                />
                <span className="priority-color high"></span>
                <span>High</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className={`save-button ${timeError ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!!timeError}
          >
            {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
