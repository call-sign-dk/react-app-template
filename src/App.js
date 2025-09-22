import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import TimeGrid from './components/TimeGrid';
import AddAppointmentModal from './components/AddAppointmentModal';
import Notification from './components/Notification';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from './services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faPlus, 
  faCalendarAlt, 
  faClock, 
  faTrashAlt,
  faBars,
  faTimes,
  faPencilAlt
} from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const calendarRef = useRef(null);

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
        showNotification('Failed to load appointments', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

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
  }, []);

  // Show notification
  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'error' });
    }, 3000);
  };

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
  
  // Handle editing an appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };
  
  // Handle saving an appointment (create or update)
  const handleSaveAppointment = async (appointmentData) => {
    try {
      setLoading(true);
      
      let savedAppointment;
      
      if (editingAppointment) {
        // Update existing appointment
        savedAppointment = await updateAppointment(editingAppointment.id, appointmentData);
        
        // Update local state
        const dateKey = formatDateKey(appointmentData.date);
        setAppointments(prev => {
          // Create a new object to avoid mutating state directly
          const newAppointments = { ...prev };
          
          // If we already have appointments for this date
          if (newAppointments[dateKey]) {
            // Replace the updated appointment in the array
            newAppointments[dateKey] = newAppointments[dateKey].map(appt => 
              appt.id === savedAppointment.id ? savedAppointment : appt
            );
          } else {
            // If this is a new date, create a new array
            newAppointments[dateKey] = [savedAppointment];
          }
          
          // If the appointment was moved from another date, remove it from the old date
          if (editingAppointment.date !== appointmentData.date) {
            const oldDateKey = formatDateKey(editingAppointment.date);
            if (newAppointments[oldDateKey]) {
              newAppointments[oldDateKey] = newAppointments[oldDateKey].filter(
                appt => appt.id !== savedAppointment.id
              );
            }
          }
          
          return newAppointments;
        });
        
        showNotification('Appointment updated successfully', 'success');
      } else {
        // Create new appointment
        savedAppointment = await createAppointment(appointmentData);
        
        // Update local state
        const dateKey = formatDateKey(appointmentData.date);
        setAppointments(prev => ({
          ...prev,
          [dateKey]: [...(prev[dateKey] || []), savedAppointment]
        }));
        
        showNotification('Appointment created successfully', 'success');
      }
      
      setShowModal(false);
      setEditingAppointment(null);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Conflict error
        showNotification('Time conflict! This slot is already booked.', 'error');
      } else {
        showNotification(`Failed to ${editingAppointment ? 'update' : 'add'} appointment. Please try again.`, 'error');
      }
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
      
      showNotification('Appointment deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Calendar functions
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
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
  };

  // Get today's appointments
  const todayKey = formatDateKey(selectedDate);
  const todaysAppointments = appointments[todayKey] || [];

  return (
    <div className="app-container">
      <Header 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        isMobileMenuOpen={mobileMenuOpen}
      />
      
      <div className="main-content">
        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <button className="close-menu-button" onClick={() => setMobileMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="mobile-menu-content">
            <div className="mobile-date-selector">
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
            
            <div className="mobile-appointments-panel">
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
                    <button className="quick-add-button" onClick={() => {
                      setEditingAppointment(null);
                      setShowModal(true);
                    }}>
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
                        <div className="appointment-actions">
                          <button 
                            className="edit-button" 
                            onClick={() => handleEditAppointment(appt)}
                            title="Edit appointment"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </button>
                          <button 
                            className="delete-button" 
                            onClick={() => handleDeleteAppointment(appt.id, appt.date)}
                            title="Delete appointment"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="date-selector">
            <button className="icon-button prev-button" onClick={handlePrevDate}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="current-date">
              <div className="calendar-button" onClick={() => setShowCalendar(!showCalendar)}>
                <FontAwesomeIcon icon={faCalendarAlt} className="date-icon" />
                <h2>{formatDateDisplay(selectedDate)}</h2>
                <FontAwesomeIcon icon={showCalendar ? faChevronLeft : faChevronRight} className="calendar-toggle-icon" />
              </div>
              {showCalendar && renderCalendar()}
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
            
            <button 
              className="add-appointment-button" 
              onClick={() => {
                setEditingAppointment(null);
                setShowModal(true);
              }}
            >
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
                  <button 
                    className="quick-add-button" 
                    onClick={() => {
                      setEditingAppointment(null);
                      setShowModal(true);
                    }}
                  >
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
                      <div className="appointment-actions">
                        <button 
                          className="edit-button" 
                          onClick={() => handleEditAppointment(appt)}
                          title="Edit appointment"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button 
                          className="delete-button" 
                          onClick={() => handleDeleteAppointment(appt.id, appt.date)}
                          title="Delete appointment"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
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
              onEditAppointment={handleEditAppointment}
            />
          </div>
        </div>
      </div>
      
      {/* Appointment modal (for both add and edit) */}
      {showModal && (
        <AddAppointmentModal
          defaultDate={selectedDate}
          editingAppointment={editingAppointment}
          onClose={() => {
            setShowModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveAppointment}
        />
      )}
      
      {/* Notification component */}
      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ ...notification, show: false })} 
        />
      )}
    </div>
  );
}

export default App;
