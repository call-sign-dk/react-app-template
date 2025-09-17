import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimeGrid from './components/TimeGrid';
import AddAppointmentModal from './components/AddAppointmentModal';
import { getAppointments, createAppointment, deleteAppointment } from './services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus, faCalendarAlt, faClock, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

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

  // Format date for display
  const formatDateDisplay = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get today's appointments
  const todayKey = formatDateKey(selectedDate);
  const todaysAppointments = appointments[todayKey] || [];

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-content">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="date-selector">
            <button className="icon-button prev-button" onClick={handlePrevDate}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="current-date">
              <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
              <h2>{formatDateDisplay(selectedDate)}</h2>
            </div>
            <button className="icon-button next-button" onClick={handleNextDate}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
          <div className="view-controls">
            <div className="view-toggle">
              <button 
                className={`toggle-button ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
              <button 
                className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
            </div>
            
            <button className="add-appointment-button" onClick={() => setShowModal(true)}>
              <FontAwesomeIcon icon={faPlus} />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Left Panel: Appointments List */}
          <div className="appointments-panel">
            <div className="panel-header">
              <h3>
                <FontAwesomeIcon icon={faClock} className="panel-icon" />
                Today's Schedule
              </h3>
              <span className="appointment-count">
                {todaysAppointments.length} {todaysAppointments.length === 1 ? 'appointment' : 'appointments'}
              </span>
            </div>
            
            <div className="panel-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading appointments...</p>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>No appointments scheduled for today</p>
                  <button className="quick-add-button" onClick={() => setShowModal(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Schedule Now</span>
                  </button>
                </div>
              ) : (
                <ul className="appointments-list">
                  {todaysAppointments.map((appt) => (
                    <li key={appt.id} className="appointment-card">
                      <div className={`priority-indicator ${appt.priority}`}></div>
                      <div className="appointment-details">
                        <div className="appointment-time">
                          <FontAwesomeIcon icon={faClock} className="time-icon" />
                          {appt.from} - {appt.to}
                        </div>
                        <h4 className="appointment-title">{appt.title}</h4>
                        {appt.description && (
                          <p className="appointment-description">{appt.description}</p>
                        )}
                      </div>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteAppointment(appt.id, appt.date)}
                        title="Delete appointment"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Panel: Time Grid */}
          <div className="time-grid-panel">
            <TimeGrid 
              date={selectedDate}
              appointments={appointments}
              loading={loading}
              viewMode={viewMode}
            />
          </div>
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
