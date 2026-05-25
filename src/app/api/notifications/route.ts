import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
// use built-in crypto for UUID to avoid extra deps
import {
  createNotification,
  deleteNotification,
  getNotifications,
  markAsRead,
  markAllRead,
} from '@/lib/notifications';

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
    const userId = user?.id || 'default-user';

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '20');
    const cursor = url.searchParams.get('cursor') || undefined;
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    const result = await getNotifications({ userId, limit, cursor, unreadOnly });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'default-user';

    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    if (action === 'mark-all-read') {
      const updated = await markAllRead(userId);
      return NextResponse.json({ ok: true, updated });
    }

    // create notification
    const type = body.type || 'custom';
    const message = body.message || '';
    const metadata = body.metadata || null;
    const id = (globalThis as any).crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
    const created = await createNotification({ id, user_id: userId, type, message, metadata });
    return NextResponse.json({ ok: true, notification: created });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'default-user';

    const body = await request.json().catch(() => ({}));
    const id = body.id;
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
    const updated = await markAsRead(userId, id);
    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = body.user_id || 'default-user';
  const id = body.id;

  if (!id) {
    return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  }

  const result = await deleteNotification(userId, id);
  return NextResponse.json({ ok: true, ...result });
}
