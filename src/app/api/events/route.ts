import { NextResponse } from 'next/server';
import type { EventFormValues } from '@/lib/types';
import {
  createEvent,
  deleteEvent,
  getEvents,
  replaceEvents,
  updateEvent,
} from '@/lib/events-store';

export async function GET() {
  const events = await getEvents();
  return NextResponse.json({ items: events });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body?.action === 'replace-all') {
    const items = Array.isArray(body.items) ? body.items : [];
    const events = await replaceEvents(items);
    return NextResponse.json({ ok: true, items: events });
  }

  const created = await createEvent(body);
  return NextResponse.json({ ok: true, item: created });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  const eventData = body?.eventData as EventFormValues | undefined;

  if (!id || !eventData) {
    return NextResponse.json({ ok: false, error: 'id and eventData are required' }, { status: 400 });
  }

  const updated = await updateEvent(id, eventData);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = body?.id as string | undefined;

  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
  }

  const deleted = await deleteEvent(id);
  return NextResponse.json({ ok: true, item: deleted });
}
