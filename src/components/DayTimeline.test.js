import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DayTimeline from './DayTimeline';

test('renders the date in the header', () => {
  const testDate = new Date(2023, 4, 15); // May 15, 2023
  render(<DayTimeline date={testDate} />);
  
  // The date should be rendered as a string using toDateString()
  // For May 15, 2023, this would be "Mon May 15 2023"
  expect(screen.getByText('Mon May 15 2023')).toBeInTheDocument();
});

test('renders 24 hour blocks', () => {
  const testDate = new Date(2023, 4, 15); // May 15, 2023
  const { container } = render(<DayTimeline date={testDate} />);
  
  const hourBlocks = container.querySelectorAll('.hour-block');
  expect(hourBlocks).toHaveLength(24);
});

test('renders hours with correct format', () => {
  const testDate = new Date(2023, 4, 15); // May 15, 2023
  render(<DayTimeline date={testDate} />);
  
  // Check a few specific hours to ensure they're formatted correctly
  expect(screen.getByText('00:00')).toBeInTheDocument();
  expect(screen.getByText('01:00')).toBeInTheDocument();
  expect(screen.getByText('12:00')).toBeInTheDocument();
  expect(screen.getByText('23:00')).toBeInTheDocument();
});
