'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import Day from './Day';

// Define the type for our notes state
interface Notes {
  [date: string]: string; // Key is 'YYYY-MM-DD', value is the note content
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Notes>({});

  // Helper functions to get calendar details
  const daysInMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const firstDayOfMonth = useCallback((year: number, month: number): number => {
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 6 for Saturday
  }, []);

  const getMonthName = useCallback((monthIndex: number): string => {
    const date = new Date(currentDate.getFullYear(), monthIndex, 1);
    return date.toLocaleString('en-US', { month: 'long' });
  }, [currentDate]);

  // Load notes from localStorage on component mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem('calendarNotes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes) as Notes);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage:", error);
    }
  }, []);

  // Save notes to localStorage whenever notes state changes
  useEffect(() => {
    try {
      localStorage.setItem('calendarNotes', JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage:", error);
    }
  }, [notes]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed month

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const addOrUpdateNote = (date: string, noteContent: string) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [date]: noteContent,
    }));
  };

  const days: JSX.Element[] = [];

  // Add empty placeholders for days before the 1st
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 bg-gray-50 aspect-square"></div>);
  }

  // Add actual days
  for (let i = 1; i <= numDays; i++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push(
      <Day
        key={dateString}
        date={i}
        fullDate={dateString}
        note={notes[dateString] || ''}
        onSaveNote={addOrUpdateNote}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
        >
          &larr; Previous
        </button>
        <h2 className="text-3xl font-extrabold text-gray-800">
          {getMonthName(month)} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
        >
          Next &rarr;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-700 mb-2 border-b-2 pb-2">
        <div className="text-red-600">Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div className="text-blue-600">Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default Calendar;