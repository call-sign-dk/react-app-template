import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimeGrid from './components/TimeGrid';
import AddAppointmentModal from './components/AddAppointmentModal';
import { getAppointments, createAppointment, deleteAppointment } from './services/api';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Format date to YYYY-MM-DD for use as object keys
  const formatDateKey = (date) => {
    if (typeof date === 'string') return date;
    return date.toISOString().substring(0, 10);
  };

  // Load appointments when selected date changes
  useEffect(() => {
    const fetchAppointments = async () => {
      const dateKey = formatDateKey(selectedDate);
      
      try {
        setLoading(true);
        const data = await getAppointments(selectedDate);
        
        setAppointments(prev => ({
          ...prev,
          [dateKey]: data
        }));
      } catch (err) {
        setErrorMessage('Failed to load appointments');
        setTimeout(() => setErrorMessage(''), 3000);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  // Navigation functions
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
  
  // Parse time string to minutes for conflict checking
  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  // Handle adding a new appointment
  const handleAddAppointment = async (newAppt) => {
    try {
      setLoading(true);
      
      // Add priority if not present
      if (!newAppt.priority) {
        newAppt.priority = 'low';
      }
      
      const createdAppointment = await createAppointment(newAppt);
      
      // Update local state
      const dateKey = formatDateKey(newAppt.date);
      setAppointments(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), createdAppointment]
      }));
      
      setShowModal(false);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Conflict error
        setErrorMessage('Time conflict! This slot is already booked.');
      } else {
        setErrorMessage('Failed to add appointment. Please try again.');
      }
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting an appointment
  const handleDeleteAppointment = async (id, date) => {
    try {
      setLoading(true);
      await deleteAppointment(id);
      
      // Update local state
      const dateKey = formatDateKey(date);
      setAppointments(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(appt => appt.id !== id)
      }));
    } catch (error) {
      setErrorMessage('Failed to delete appointment');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get today's appointments
  const todayKey = formatDateKey(selectedDate);
  const todaysAppointments = appointments[todayKey] || [];

  return (
    <div className="App">
      <Header />
      
      <div className="content">
        {/* Left Pane: Appointments List */}
        <div className="left-pane">
          <h3>Appointments</h3>
          {loading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
            </div>
          ) : todaysAppointments.length === 0 ? (
            <p className="no-appointments">No appointments scheduled</p>
          ) : (
            <ul>
              {todaysAppointments.map((appt) => (
                <li key={appt.id} className={`appt ${appt.priority}`}>
                  <strong>{appt.from} - {appt.to}</strong>
                  <div>{appt.title}</div>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteAppointment(appt.id, appt.date)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
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

          {/* Time Grid */}
          <TimeGrid 
            date={selectedDate}
            appointments={appointments}
            loading={loading}
          />
        </div>
      </div>
      
      {/* Add appointment modal */}
      {showModal && (
        <AddAppointmentModal
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSave={handleAddAppointment}
        />
      )}
      
      {/* Error notification */}
      {errorMessage && (
        <div className="error-notification">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default App;
