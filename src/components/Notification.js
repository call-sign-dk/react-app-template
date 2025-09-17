import React, { useEffect } from 'react';
import '../styles/Notification.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function Notification({ message, type = 'error', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'info':
        return faInfoCircle;
      case 'error':
      default:
        return faExclamationTriangle;
    }
  };
  
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <FontAwesomeIcon icon={getIcon()} className="notification-icon" />
        <p>{message}</p>
      </div>
      <button className="close-notification" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}

export default Notification;
