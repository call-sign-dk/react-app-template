import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TimeGrid from './components/TimeGrid';
import AddAppointmentModal from './components/AddAppointmentModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Format date to YYYY-MM-DD for use as object keys
  const formatDateKey = (date) => date.toISOString().substring(0, 10);
  
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
  const handleAddAppointment = (newAppt) => {
    const dateKey = newAppt.date;
    const existing = appointments[dateKey] || [];

    const newFrom = parseTime(newAppt.from);
    const newTo = parseTime(newAppt.to);

    // Check for conflicts
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

    // Add the new appointment
    const updated = {
      ...appointments,
      [dateKey]: [...existing, newAppt],
    };

    setAppointments(updated);
    setShowModal(false);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="App">
      <Header />
      
      <div className="content">
        {/* Mobile menu toggle button */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>
        
        {/* Sidebar - hidden on mobile unless menu is open */}
        <div className={`sidebar-container ${mobileMenuOpen ? 'open' : ''}`}>
          <Sidebar 
            date={selectedDate}
            onPrev={handlePrevDate}
            onNext={handleNextDate}
            appointments={appointments}
            onSelectDate={setSelectedDate}
          />
        </div>
        
        {/* Main content area with time grid */}
        <div className="main-content">
          <TimeGrid 
            date={selectedDate}
            appointments={appointments}
          />
          
          {/* Add appointment button */}
          <button className="add-appointment-btn" onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
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
    </div>
  );
}

export default App;
