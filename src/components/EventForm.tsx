"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Edit3, Plus, Trash2 } from "lucide-react";
import DeleteConfirmation from "./DeleteConfirmation";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: {
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    recurring?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      interval: number;
      endDate?: string;
    };
    timezone?: string;
  }) => void;
  onDelete?: (eventId: string) => void;
  event?: {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    recurring?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      interval: number;
      endDate?: string;
    };
    timezone?: string;
  } | null;
  selectedDate?: string;
  quickActionType?: string;
  selectedTimezone?: string;
}

export default function EventForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  event,
  selectedDate,
  quickActionType,
  selectedTimezone,
}: EventFormProps) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(true);
  // Removed unused timezone state variable
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (event) {
      // Editing existing event
      setTitle(event.title);
      setStart(new Date(event.start).toISOString().slice(0, 16));
      setEnd(new Date(event.end).toISOString().slice(0, 16));
      setAllDay(event.allDay || false);
      // Removed setTimezone call
      setIsRecurring(!!event.recurring);
      if (event.recurring) {
        setRecurringFrequency(event.recurring.frequency);
        setRecurringInterval(event.recurring.interval);
        setRecurringEndDate(event.recurring.endDate || "");
      }
    } else if (selectedDate) {
      // Creating new event with selected date (from quick actions or calendar click)
      setTitle("");

      // Set appropriate defaults based on quick action type
      if (
        quickActionType === "today" ||
        quickActionType === "tomorrow" ||
        quickActionType === "nextWeek"
      ) {
        // For quick actions, default to all-day events
        // Create timezone-aware datetime for the selected date
        setStart(selectedDate);
        setEnd(selectedDate);
        setAllDay(true);
      } else {
        // For calendar clicks, default to timed events in selected timezone
        setStart(selectedDate + "T09:00");
        setEnd(selectedDate + "T10:00");
        setAllDay(true);
      }

      // Reset recurring settings for new events
      setIsRecurring(false);
      setRecurringFrequency("weekly");
      setRecurringInterval(1);
      setRecurringEndDate("");
    } else {
      // Creating new event without selected date (custom button)
      setTitle("");

      // Get current time in selected timezone
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

      setStart(startTime.toISOString().slice(0, 16));
      setEnd(endTime.toISOString().slice(0, 16));
      setAllDay(false);

      // Reset recurring settings for new events
      setIsRecurring(false);
      setRecurringFrequency("weekly");
      setRecurringInterval(1);
      setRecurringEndDate("");
    }
  }, [event, selectedDate, quickActionType, isOpen, selectedTimezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // For all-day events, use the dates as-is since they're already in the correct timezone
      // The timezone conversion is handled when the date is selected in the Calendar component

      const eventData = {
        title: title.trim(),
        start: start,
        end: end,
        allDay,
        timezone:
          selectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(isRecurring && {
          recurring: {
            frequency: recurringFrequency,
            interval: recurringInterval,
            ...(recurringEndDate && { endDate: recurringEndDate }),
          },
        }),
      };

      console.log(
        "Creating event with timezone:",
        selectedTimezone,
        "Date:",
        start
      );

      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked);
    if (checked) {
      // Convert to date-only format
      const startDate = start.split("T")[0];
      const endDate = end.split("T")[0];
      setStart(startDate);
      setEnd(endDate);
    } else {
      // Convert to datetime format
      const startDate = start.split("T")[0];
      const endDate = end.split("T")[0];
      setStart(startDate + "T09:00");
      setEnd(endDate + "T10:00");
    }
  };

  const handleDelete = () => {
    if (event && onDelete) {
      console.log("Deleting event:", event.id, event.title);
      onDelete(event.id);
      setShowDeleteConfirmation(false);
      onClose();
    } else {
      console.error("Delete failed: event or onDelete not available", {
        event,
        onDelete,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3">
            {event ? (
              <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            ) : (
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {event ? "Edit Event" : "New Event"}
              </h2>
              {!event && quickActionType && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {quickActionType === "today" && "Creating event for today"}
                  {quickActionType === "tomorrow" &&
                    "Creating event for tomorrow"}
                  {quickActionType === "nextWeek" &&
                    "Creating event for next week"}
                  {quickActionType === "custom" && "Creating custom event"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Event Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => handleAllDayChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="allDay"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              All day event
            </label>
          </div>

          {/* Date/Time Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="start"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Start
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                id="start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label
                htmlFor="end"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                End
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                id="end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Recurring Event Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="recurring"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Recurring event
            </label>
          </div>

          {/* Recurring Event Options */}
          {isRecurring && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) =>
                      setRecurringFrequency(
                        e.target.value as
                          | "daily"
                          | "weekly"
                          | "monthly"
                          | "yearly"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Every
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={recurringInterval}
                    onChange={(e) =>
                      setRecurringInterval(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {event && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="px-4 py-3 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting
                ? "Saving..."
                : event
                ? "Update Event"
                : "Create Event"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
        eventTitle={event?.title || ""}
      />
    </div>
  );
}
