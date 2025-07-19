'use client'; // Add this if you're using the App Router

import React, { useState, useEffect } from 'react';

interface DayProps {
  date: number;
  fullDate: string; // Format: 'YYYY-MM-DD'
  note: string;
  onSaveNote: (date: string, noteContent: string) => void;
}

const Day: React.FC<DayProps> = ({ date, fullDate, note, onSaveNote }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<string>(note);

  // Update currentNote when the prop `note` changes (e.g., when navigating months)
  useEffect(() => {
    setCurrentNote(note);
  }, [note]);

  const handleSave = () => {
    onSaveNote(fullDate, currentNote);
    setShowModal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for new lines, but Enter to save
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default new line behavior
      handleSave();
    }
  };

  return (
    <div
      className="p-3 border border-gray-200 h-32 flex flex-col justify-between cursor-pointer hover:bg-blue-50 transition-colors duration-200 relative overflow-hidden rounded-md"
      onClick={() => setShowModal(true)}
    >
      <div className="text-base font-semibold text-gray-800">{date}</div>
      {note && (
        <div className="text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap flex-grow">
          {note}
        </div>
      )}
      {!note && (
        <div className="text-xs text-gray-400 flex-grow">
          Add note...
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-5">Note for {fullDate}</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows={6}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your note here... (Shift+Enter for new line)"
              autoFocus
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Day;