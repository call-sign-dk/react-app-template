import React, { useState } from 'react';
import '../styles/AddAppointmentModal.css';

function AddAppointmentModal({ onClose, onSave, defaultDate }) {
  const [mode, setMode] = useState('today'); // 'today' or 'later'
  const [date, setDate] = useState(defaultDate.toISOString().substring(0, 10));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('low');

  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const formatDateKey = (d) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split('T')[0];
  };

  const duration = from && to ? Math.max(parseTime(to) - parseTime(from), 0) : 0;

  const handleSave = () => {
    if (!from || !to) {
      alert("Please select both From and To times");
      return;
    }

    const fromMins = parseTime(from);
    const toMins = parseTime(to);

    if (toMins <= fromMins) {
      alert("End time must be after start time");
      return;
    }

    if (!title.trim() || !desc.trim()) {
      alert("Please enter title and description");
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>New Appointment</h2>

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

        <div className="date-display">
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


        <input
          type="time"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="time"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />

        {duration > 0 && (
          <div className="duration-display">
            Duration: {Math.floor(duration / 60)}h {duration % 60}m
          </div>
        )}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low (Green)</option>
          <option value="medium">Medium (Orange)</option>
          <option value="high">High (Red)</option>
        </select>

        <div className="modal-actions">
          <button onClick={handleSave}>Book</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
