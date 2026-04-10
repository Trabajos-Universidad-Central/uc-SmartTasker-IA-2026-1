'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { EventFormValues } from '@/lib/types';

export type { EventFormValues } from '@/lib/types';

export type EventWithId = EventFormValues & { id: string };

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsContextType {
  events: EventWithId[];
  addEvent: (event: EventFormValues) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, eventData: EventFormValues) => void;
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return context;
}

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventWithId[]>([]);

  const addEvent = (event: EventFormValues) => {
    const newEvent: EventWithId = { ...event, id: crypto.randomUUID() };
    if (newEvent.type === 'tarea' && !newEvent.status) {
      newEvent.status = 'not-started';
    }
    setEvents((prev) => [...prev, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const updateEvent = (
    id: string,
    eventData: EventFormValues
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...eventData, id } : event
      )
    );
  };

  return (
    <EventsContext.Provider
      value={{ events, addEvent, deleteEvent, updateEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
}
