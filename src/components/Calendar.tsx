"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Globe,
} from "lucide-react";
import EventForm from "./EventForm";

interface Event {
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
  backgroundColor?: string;
  borderColor?: string;
}

export default function Calendar() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [quickActionType, setQuickActionType] = useState<string>("");
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Generate different colors for events
  const getEventColor = (index: number) => {
    const colors = [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#F59E0B", // Yellow
      "#EF4444", // Red
      "#8B5CF6", // Purple
      "#06B6D4", // Cyan
      "#F97316", // Orange
      "#EC4899", // Pink
    ];
    return colors[index % colors.length];
  };

  // Generate recurring events
  const generateRecurringEvents = (events: Event[]) => {
    const allEvents: Event[] = [];

    events.forEach((event, index) => {
      // Add the original event
      allEvents.push({
        ...event,
        backgroundColor: getEventColor(index),
        borderColor: getEventColor(index),
      });

      // Generate recurring instances if applicable
      if (event.recurring) {
        try {
          const recurringConfig =
            typeof event.recurring === "string"
              ? JSON.parse(event.recurring)
              : event.recurring;

          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          const duration = endDate.getTime() - startDate.getTime();

          // eslint-disable-next-line prefer-const
          let currentDate = new Date(startDate);
          const maxInstances = 50; // Limit to prevent performance issues
          let instanceCount = 0;

          while (instanceCount < maxInstances) {
            // Calculate next occurrence
            switch (recurringConfig.frequency) {
              case "daily":
                currentDate.setDate(
                  currentDate.getDate() + recurringConfig.interval
                );
                break;
              case "weekly":
                currentDate.setDate(
                  currentDate.getDate() + 7 * recurringConfig.interval
                );
                break;
              case "monthly":
                currentDate.setMonth(
                  currentDate.getMonth() + recurringConfig.interval
                );
                break;
              case "yearly":
                currentDate.setFullYear(
                  currentDate.getFullYear() + recurringConfig.interval
                );
                break;
            }

            // Check if we've reached the end date
            if (
              recurringConfig.endDate &&
              currentDate > new Date(recurringConfig.endDate)
            ) {
              break;
            }

            // Create recurring instance
            const recurringEndDate = new Date(currentDate.getTime() + duration);
            allEvents.push({
              ...event,
              id: `${event.id}_recurring_${instanceCount}`,
              start: currentDate.toISOString(),
              end: recurringEndDate.toISOString(),
              backgroundColor: getEventColor(index),
              borderColor: getEventColor(index),
            });

            instanceCount++;
          }
        } catch (error) {
          console.error("Error generating recurring events:", error);
        }
      }
    });

    return allEvents;
  };

  // Add colors to events and generate recurring instances
  const eventsWithColors = generateRecurringEvents(events);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = async (arg: { dateStr: string }) => {
    // Convert the clicked date to the selected timezone
    const clickedDate = new Date(arg.dateStr);
    const dateInTimezone = clickedDate.toLocaleDateString("en-CA", {
      timeZone: selectedTimezone,
    });
    openEventForm(undefined, dateInTimezone);
  };

  const handleEventClick = async (arg: {
    event: { id: string; title: string };
  }) => {
    const event = arg.event;
    const eventData = events.find((e) => e.id === event.id);
    if (eventData) {
      openEventForm(eventData);
    }
  };

  const handleEventDrop = async (arg: {
    event: { id: string; start: Date | null; end?: Date | null };
  }) => {
    const event = arg.event;
    if (!event.start) return;

    // Optimistic update - immediately update the UI
    const optimisticEvent = {
      id: event.id,
      start: event.start.toISOString(),
      end: event.end ? event.end.toISOString() : event.start.toISOString(),
    };

    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? { ...e, start: optimisticEvent.start, end: optimisticEvent.end }
          : e
      )
    );

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: event.start.toISOString(),
          end: event.end ? event.end.toISOString() : event.start.toISOString(),
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        // Update with server response to ensure consistency
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === event.id ? updatedEvent : e))
        );
      } else {
        // Revert optimistic update on error
        console.error(
          "Failed to update event:",
          response.status,
          response.statusText
        );
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error updating event:", error);
      // Revert optimistic update on error
      // You could add a toast notification here
    }
  };

  const handleEventFormSubmit = async (eventData: {
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
  }) => {
    console.log("Submitting event data:", eventData);

    if (selectedEvent) {
      // Update existing event
      try {
        const response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const updatedEvent = await response.json();
          console.log("Event updated successfully:", updatedEvent);
          setEvents(
            events.map((e) => (e.id === selectedEvent.id ? updatedEvent : e))
          );
        } else {
          console.error(
            "Failed to update event:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error updating event:", error);
      }
    } else {
      // Create new event
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const savedEvent = await response.json();
          console.log("Event created successfully:", savedEvent);
          setEvents([...events, savedEvent]);
        } else {
          console.error(
            "Failed to create event:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
  };

  const openEventForm = (event?: Event, date?: string, actionType?: string) => {
    setSelectedEvent(event || null);
    setSelectedDate(date || "");
    setQuickActionType(actionType || "");
    setIsEventFormOpen(true);
  };

  const closeEventForm = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(null);
    setSelectedDate("");
    setQuickActionType("");
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log("Calendar: Deleting event with ID:", eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Event deleted successfully");
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        console.error(
          "Failed to delete event:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view your calendar</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">My Calendar</h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                Manage your events and projects
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-blue-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-xs text-blue-200">Timezone</span>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="bg-transparent text-blue-100 text-xs sm:text-sm border-none outline-none cursor-pointer hover:text-gray-700 transition-colors font-medium"
                  style={{
                    backgroundImage: "none",
                    paddingRight: "20px",
                    appearance: "auto",
                  }}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">ET</option>
                  <option value="America/Chicago">CT</option>
                  <option value="America/Denver">MT</option>
                  <option value="America/Los_Angeles">PT</option>
                  <option value="America/Anchorage">AKT</option>
                  <option value="Pacific/Honolulu">HT</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">CET</option>
                  <option value="Europe/Berlin">CET</option>
                  <option value="Europe/Moscow">MSK</option>
                  <option value="Asia/Tokyo">JST</option>
                  <option value="Asia/Shanghai">CST</option>
                  <option value="Asia/Kolkata">IST</option>
                  <option value="Asia/Dubai">GST</option>
                  <option value="Australia/Sydney">AEST</option>
                  <option value="Pacific/Auckland">NZST</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="p-4 sm:p-6">
        {/* Quick Actions Section */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center gap-3 text-gray-700 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Quick Actions
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Create events quickly
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => {
                // Get today's date in the selected timezone
                const now = new Date();
                const today = new Date(
                  now.toLocaleString("en-US", { timeZone: selectedTimezone })
                )
                  .toISOString()
                  .split("T")[0];
                openEventForm(undefined, today, "today");
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 group"
            >
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">Today</div>
                <div className="text-xs text-gray-500">Add event for today</div>
              </div>
            </button>

            <button
              onClick={() => {
                // Get tomorrow's date in the selected timezone
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowDate = new Date(
                  tomorrow.toLocaleString("en-US", {
                    timeZone: selectedTimezone,
                  })
                )
                  .toISOString()
                  .split("T")[0];
                openEventForm(undefined, tomorrowDate, "tomorrow");
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 hover:border-green-300 group"
            >
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">Tomorrow</div>
                <div className="text-xs text-gray-500">
                  Add event for tomorrow
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                // Get next week's date in the selected timezone
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                const nextWeekDate = new Date(
                  nextWeek.toLocaleString("en-US", {
                    timeZone: selectedTimezone,
                  })
                )
                  .toISOString()
                  .split("T")[0];
                openEventForm(undefined, nextWeekDate, "nextWeek");
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 hover:border-purple-300 group"
            >
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">
                  Next Week
                </div>
                <div className="text-xs text-gray-500">
                  Add event for next week
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                openEventForm(undefined, undefined, "custom");
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white text-orange-700 rounded-lg hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 hover:border-orange-300 group"
            >
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">Custom</div>
                <div className="text-xs text-gray-500">
                  Add event with custom date
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={eventsWithColors}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            editable={true}
            selectable={true}
            selectMirror={true}
            weekends={true}
            height="auto"
            eventTextColor="#FFFFFF"
            eventDisplay="block"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            moreLinkClick="popover"
            dayMaxEventRows={false}
            eventMaxStack={3}
            eventDidMount={(info) => {
              // Add visual indicator for recurring events
              if (info.event.extendedProps.recurring) {
                info.el.style.borderLeft = "4px solid #10b981";
                info.el.title = `${info.event.title} (Recurring)`;
              }
            }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            nowIndicator={true}
            scrollTime="08:00:00"
            lazyFetching={true}
            rerenderDelay={10}
            eventResize={handleEventDrop}
          />
        </div>

        {/* Event Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Total Events
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {events.length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                This Month
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {
                events.filter((event) => {
                  const eventDate = new Date(event.start);
                  const now = new Date();
                  return (
                    eventDate.getMonth() === now.getMonth() &&
                    eventDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">User</span>
            </div>
            <p className="text-lg font-semibold text-purple-900 mt-1">
              {session.user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm
        isOpen={isEventFormOpen}
        onClose={closeEventForm}
        onSubmit={handleEventFormSubmit}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate}
        quickActionType={quickActionType}
        selectedTimezone={selectedTimezone}
      />
    </div>
  );
}
