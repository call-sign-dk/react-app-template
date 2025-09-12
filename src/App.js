import React, { useState } from 'react';
import Header from './components/Header';
import AddAppointmentModal from './components/AddAppointmentModal';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [showModal, setShowModal] = useState(false);

  const formatDateKey = (date) => date.toISOString().substring(0, 10);

  const handlePrevDate = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDate = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const handleAddAppointment = (newAppt) => {
    const dateKey = newAppt.date;
    const existing = appointments[dateKey] || [];

    const newFrom = parseTime(newAppt.from);
    const newTo = parseTime(newAppt.to);

    const hasConflict = existing.some((appt) => {
      const from = parseTime(appt.from);
      const to = parseTime(appt.to);
      return (
        (newFrom >= from && newFrom < to) ||
        (newTo > from && newTo <= to) ||
        (newFrom <= from && newTo >= to)
      );
    });

    if (hasConflict) {
      alert('Time conflict! This slot is already booked.');
      return;
    }

    const updated = {
      ...appointments,
      [dateKey]: [...existing, newAppt],
    };

    setAppointments(updated);
  };

  const todayKey = formatDateKey(selectedDate);
  const todaysAppointments = appointments[todayKey] || [];

  return (
    <div className="App">
      {/* Keep Header if you want for branding or just leave it */}
      <Header
        date={selectedDate}
        onPrev={handlePrevDate}
        onNext={handleNextDate}
        onAdd={() => setShowModal(true)}
      />

      <div className="content">
        {/* Left Pane: Appointments List */}
        <div className="left-pane">
          <h3>Appointments</h3>
          <ul>
            {todaysAppointments.map((appt, idx) => (
              <li key={idx} className={`appt ${appt.priority}`}>
                <strong>{appt.from} - {appt.to}</strong>
                <div>{appt.title}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane: Timeline and Controls */}
        <div className="right-pane">
          {/* Header in Right Pane with Navigation and Add Button */}
          <div className="right-pane-header">
            <div className="date-nav">
              <button onClick={handlePrevDate}>←</button>
              <h3>{selectedDate.toDateString()}</h3>
              <button onClick={handleNextDate}>→</button>
              <button onClick={() => setShowModal(true)} className="add-appt-btn">+ Add Appointment</button>
            </div>
          </div>

          {/* Time Matrix (6x4 Grid of 24 Hours) */}
          <div className="timeline-grid">
            {[...Array(24)].map((_, hour) => (
              <div key={hour} className="grid-slot">
                <span className="time-label">{hour.toString().padStart(2, '0')}:00</span>
                <div className="slot-box">
                  {todaysAppointments.map((appt, i) => {
                    const from = parseTime(appt.from);
                    const to = parseTime(appt.to);
                    const start = from / 60;
                    const end = to / 60;
                    if (start <= hour && hour < end) {
                      return (
                        <div
                          key={i}
                          className={`slot ${appt.priority}`}
                          title={`${appt.title} (${appt.from}–${appt.to})`}
                        ></div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Adding Appointment */}
      {showModal && (
        <AddAppointmentModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSave={handleAddAppointment}
        />
      )}
    </div>
  );
}

export default App;
