import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TimeGrid from './components/TimeGrid';
import AddAppointmentModal from './components/AddAppointmentModal';
import Notification from './components/Notification';
import DashboardHeader from './components/DashboardHeader';
import AppointmentsPanel from './components/AppointmentsPanel';
import MobileMenu from './components/MobileMenu';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from './services/api';
import { formatDateKey, formatDateDisplay } from './utils/timeUtils';
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
  
  // Debug: Log when selectedDate changes
  useEffect(() => {
    console.log("selectedDate changed:", selectedDate);
    console.log("selectedDate ISO:", selectedDate.toISOString());
    console.log("selectedDate formatted:", selectedDate.toISOString().substring(0, 10));
  }, [selectedDate]);

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

  // Function to handle opening the modal with debug logs
  const handleOpenModal = () => {
    console.log("handleOpenModal called, selectedDate:", selectedDate);
    console.log("selectedDate formatted:", selectedDate.toISOString().substring(0, 10));
    setEditingAppointment(null);
    setShowModal(true);
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
        <MobileMenu 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          selectedDate={selectedDate}
          onPrevDate={handlePrevDate}
          onNextDate={handleNextDate}
          appointments={todaysAppointments}
          onAddAppointment={handleOpenModal}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={handleDeleteAppointment}
        />
        
        {/* Dashboard Header */}
        <DashboardHeader 
          selectedDate={selectedDate}
          onPrevDate={handlePrevDate}
          onNextDate={handleNextDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddAppointment={handleOpenModal}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          setSelectedDate={setSelectedDate}
        />
        
        <div className="dashboard-content">
          {/* Left Panel: Appointments List */}
          <AppointmentsPanel 
            appointments={todaysAppointments}
            onAddAppointment={handleOpenModal}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            loading={loading}
          />

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
            console.log("Modal closing");
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
