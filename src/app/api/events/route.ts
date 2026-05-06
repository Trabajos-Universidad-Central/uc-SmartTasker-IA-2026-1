import { NextRequest, NextResponse } from 'next/server';
import type { EventFormValues } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import * as supabaseEvents from '@/lib/supabase/events';

async function getServerClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await supabaseEvents.getEvents(user.id);
    return NextResponse.json({ items: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    if (body?.action === 'replace-all') {
      // No es necesario con Supabase, pero mantenemos compatibilidad
      const items = Array.isArray(body.items) ? body.items : [];
      return NextResponse.json({ ok: true, items });
    }

    const eventData: EventFormValues = body;
    const event = await supabaseEvents.createEvent(user.id, eventData);
    return NextResponse.json({ ok: true, item: event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body?.id as string | undefined;
    const eventData = body?.eventData as EventFormValues | undefined;

    if (!id || !eventData) {
      return NextResponse.json({ ok: false, error: 'id and eventData are required' }, { status: 400 });
    }

    const updated = await supabaseEvents.updateEvent(user.id, id, eventData);
    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body?.id as string | undefined;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
    }

    const deleted = await supabaseEvents.deleteEvent(user.id, id);
    return NextResponse.json({ ok: true, item: deleted });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
