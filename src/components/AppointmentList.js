import React from 'react';
import '../styles/AppointmentList.css';

function AppointmentList() {
  const appointments = [
    { time: '09:00 AM', title: 'Team Meeting' },
    { time: '11:30 AM', title: 'Client Call' },
    { time: '02:00 PM', title: 'Project Planning' },
  ];

  return (
    <div className="appointment-list">
      <h3>Appointments</h3>
      <ul>
        {appointments.map((a, i) => (
          <li key={i}>
            <strong>{a.time}</strong> – {a.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AppointmentList;
