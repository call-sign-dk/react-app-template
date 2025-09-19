import React from 'react';
import '../styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

function Header({ onMenuToggle, isMobileMenuOpen }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <FontAwesomeIcon icon={faCalendarAlt} className="brand-icon" />
        <h1>Appointment Scheduler</h1>
      </div>
      
      <div className="header-actions">
        <button className="mobile-menu-toggle" onClick={onMenuToggle}>
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
        </button>
      </div>
    </header>
  );
}

export default Header;
