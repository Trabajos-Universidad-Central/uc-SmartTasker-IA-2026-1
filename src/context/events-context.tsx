'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { EventFormValues } from '@/lib/types';
import { createUserNotification } from '@/lib/notifications-client';
import { parseLocalDate } from '@/lib/date';

export type { EventFormValues } from '@/lib/types';

export type EventWithId = EventFormValues & { id: string };

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsContextType {
  events: EventWithId[];
  addEvent: (event: EventFormValues) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, eventData: EventFormValues) => Promise<void>;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  function parseEvent(event: Omit<EventWithId, 'date'> & { date: string } | EventWithId): EventWithId {
    if (event && typeof event.date === 'string') {
      return {
        ...event,
        date: parseLocalDate(event.date) ?? new Date(event.date),
      };
    }

    return event as EventWithId;
  }

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch('/api/events', { cache: 'no-store' });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Usuario no autenticado, no cargar eventos
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch events: ${response.status}`);
        }

        const json = await response.json();
        const serverEvents = Array.isArray(json.items)
          ? json.items.map((event: Omit<EventWithId, 'date'> & { date: string }) => parseEvent(event))
          : [];

        setEvents(serverEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  const addEvent = async (event: EventFormValues) => {
    const newEvent: EventWithId = { ...event, id: crypto.randomUUID() };
    if (newEvent.type === 'tarea' && !newEvent.status) {
      newEvent.status = 'not-started';
    }
    
    // Optimistic update
    setEvents((prev) => [...prev, newEvent]);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      const result = await response.json();
      
      // Actualizar con el ID real de la BD y asegurar que la fecha sea Date
      setEvents((prev) =>
        prev.map((e) =>
          e.id === newEvent.id
            ? parseEvent(result.item ? result.item : newEvent)
            : e
        )
      );

      await createUserNotification({
        action: 'created',
        entity: newEvent.type,
        title: newEvent.title,
        entityId: result.item?.id || newEvent.id,
      }).catch((error) => {
        console.error('Error creating notification:', error);
      });
    } catch (error) {
      console.error('Error saving event:', error);
      // Remover el evento si falló
      setEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    const eventToDelete = events.find((event) => event.id === id);
    
    // Optimistic update
    setEvents((prev) => prev.filter((event) => event.id !== id));

    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      if (eventToDelete) {
        await createUserNotification({
          action: 'deleted',
          entity: eventToDelete.type,
          title: eventToDelete.title,
          entityId: id,
        }).catch((error) => {
          console.error('Error creating notification:', error);
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      // Restore el evento si falló
      if (eventToDelete) {
        setEvents((prev) => [...prev, eventToDelete]);
      }
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: EventFormValues) => {
    const currentEvent = events.find((event) => event.id === id);
    
    if (!currentEvent) {
      throw new Error('Event not found');
    }

    // Optimistic update
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...eventData, id } : event
      )
    );

    try {
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, eventData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await createUserNotification({
        action: 'updated',
        entity: currentEvent.type,
        title: eventData.title ?? currentEvent.title,
        entityId: id,
      }).catch((error) => {
        console.error('Error creating notification:', error);
      });
    } catch (error) {
      console.error('Error updating event:', error);
      // Restore el evento si falló
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? currentEvent : event))
      );
      throw error;
    }
  };

  return (
    <EventsContext.Provider
      value={{ events, addEvent, deleteEvent, updateEvent, loading }}
    >
      {children}
    </EventsContext.Provider>
  );
}
