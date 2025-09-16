import React from 'react';
import '../styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <FontAwesomeIcon icon={faCalendarAlt} />
        <h1>Calendar</h1>
      </div>
    </header>
  );
}

export default Header;
