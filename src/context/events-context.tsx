'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { EventFormValues as UnidentifiedEventFormValues } from '@/lib/types';

export type EventFormValues = UnidentifiedEventFormValues & { id: string };

interface EventsContextType {
  events: EventFormValues[];
  addEvent: (event: UnidentifiedEventFormValues) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, eventData: UnidentifiedEventFormValues) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventFormValues[]>([]);

  const addEvent = (event: UnidentifiedEventFormValues) => {
    const newEvent: EventFormValues = { ...event, id: crypto.randomUUID() };
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
    eventData: UnidentifiedEventFormValues
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

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
