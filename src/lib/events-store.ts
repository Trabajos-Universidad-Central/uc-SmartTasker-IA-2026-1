import fs from 'fs/promises';
import path from 'path';
import type { EventFormValues } from '@/lib/types';
import { parseLocalDate } from '@/lib/date';

export type StoredEvent = EventFormValues & { id: string };

const FILE_PATH = path.join(process.cwd(), 'data', 'events.json');

async function readAll(): Promise<StoredEvent[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
      await fs.writeFile(FILE_PATH, '[]', 'utf-8');
      return [];
    }

    throw error;
  }
}

async function writeAll(events: StoredEvent[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
}

export async function getEvents() {
  const events = await readAll();
  return events.sort((a, b) => {
    const aTime = parseLocalDate(a.date)?.getTime() ?? 0;
    const bTime = parseLocalDate(b.date)?.getTime() ?? 0;
    return aTime - bTime;
  });
}

export async function createEvent(event: StoredEvent) {
  const events = await readAll();
  events.push(event);
  await writeAll(events);
  return event;
}

export async function replaceEvents(newEvents: StoredEvent[]) {
  await writeAll(newEvents);
  return newEvents;
}

export async function updateEvent(id: string, eventData: EventFormValues) {
  const events = await readAll();
  const nextEvents = events.map((event) =>
    event.id === id ? { ...event, ...eventData, id } : event
  );
  await writeAll(nextEvents);
  return nextEvents.find((event) => event.id === id) ?? null;
}

export async function deleteEvent(id: string) {
  const events = await readAll();
  const eventToDelete = events.find((event) => event.id === id) ?? null;
  const nextEvents = events.filter((event) => event.id !== id);
  await writeAll(nextEvents);
  return eventToDelete;
}
