"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

export default function Calendar() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (session) {
      // Fetch events for the logged-in user
      fetch("/api/events")
        .then((res) => res.json())
        .then((data) => setEvents(data));
    }
  }, [session]);

  // Replace 'any' with the correct type for arg
  const handleDateClick = (arg: { dateStr: string }) => {
    const title = prompt("Enter Event Title:");
    if (title) {
      const newEvent = {
        title,
        start: arg.dateStr,
        end: arg.dateStr,
      };
      // Save the new event to the database
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
        .then((res) => res.json())
        .then((savedEvent) => {
          setEvents([...events, savedEvent]);
        });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        editable={true}
      />
    </div>
  );
}
