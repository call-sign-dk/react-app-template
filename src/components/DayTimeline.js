import React from 'react';
import '../styles/DayTimeline.css';

function DayTimeline({ date }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="day-timeline">
      <h3>{date.toDateString()}</h3>
      <div className="timeline-scroll">
        {hours.map((hour) => (
          <div className="hour-block" key={hour}>
            {hour.toString().padStart(2, '0')}:00
          </div>
        ))}
      </div>
    </div>
  );
}

export default DayTimeline;
