'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { EventFormValues } from '@/lib/types';
import { createUserNotification } from '@/lib/notifications-client';

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

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        const json = await response.json();
        const serverEvents = Array.isArray(json.items)
          ? json.items.map((event: Omit<EventWithId, 'date'> & { date: string }) => ({
              ...event,
              date: new Date(event.date),
            }))
          : [];

        if (serverEvents.length > 0) {
          setEvents(serverEvents);
          return;
        }

        const rawLocalEvents = window.localStorage.getItem('smarttasker-events');
        if (!rawLocalEvents) {
          return;
        }

        const parsedLocalEvents = JSON.parse(rawLocalEvents) as Array<
          Omit<EventWithId, 'date'> & { date: string }
        >;
        const migratedEvents = parsedLocalEvents.map((event) => ({
          ...event,
          date: new Date(event.date),
        }));

        if (migratedEvents.length === 0) {
          return;
        }

        setEvents(migratedEvents);

        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'replace-all',
            items: migratedEvents,
          }),
        });

        window.localStorage.removeItem('smarttasker-events');
      } catch (error) {
        console.error('Error loading persisted events:', error);
      }
    }

    void loadEvents();
  }, []);

  const addEvent = (event: EventFormValues) => {
    const newEvent: EventWithId = { ...event, id: crypto.randomUUID() };
    if (newEvent.type === 'tarea' && !newEvent.status) {
      newEvent.status = 'not-started';
    }
    setEvents((prev) => [...prev, newEvent]);

    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    }).catch((error) => {
      console.error('Error saving event:', error);
    });

    void createUserNotification({
      action: 'created',
      entity: newEvent.type,
      title: newEvent.title,
      entityId: newEvent.id,
    }).catch((error) => {
      console.error('Error creating notification:', error);
    });
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const eventToDelete = prev.find((event) => event.id === id);

      void fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch((error) => {
        console.error('Error deleting event:', error);
      });

      if (eventToDelete) {
        void createUserNotification({
          action: 'deleted',
          entity: eventToDelete.type,
          title: eventToDelete.title,
          entityId: eventToDelete.id,
        }).catch((error) => {
          console.error('Error creating notification:', error);
        });
      }

      return prev.filter((event) => event.id !== id);
    });
  };

  const updateEvent = (
    id: string,
    eventData: EventFormValues
  ) => {
    setEvents((prev) => {
      const currentEvent = prev.find((event) => event.id === id);

      void fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, eventData }),
      }).catch((error) => {
        console.error('Error updating event:', error);
      });

      if (currentEvent) {
        void createUserNotification({
          action: 'updated',
          entity: currentEvent.type,
          title: eventData.title ?? currentEvent.title,
          entityId: id,
        }).catch((error) => {
          console.error('Error creating notification:', error);
        });
      }

      return prev.map((event) =>
        event.id === id ? { ...event, ...eventData, id } : event
      );
    });
  };

  return (
    <EventsContext.Provider
      value={{ events, addEvent, deleteEvent, updateEvent }}
    >
      {children}
    </EventsContext.Provider>
  );
}
