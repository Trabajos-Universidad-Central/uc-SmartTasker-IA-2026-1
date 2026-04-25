import { NextResponse } from 'next/server';
// use built-in crypto for UUID to avoid extra deps
import {
  createNotification,
  deleteNotification,
  getNotifications,
  markAsRead,
  markAllRead,
} from '@/lib/notifications';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id') || 'default-user';
  const limit = Number(url.searchParams.get('limit') || '20');
  const cursor = url.searchParams.get('cursor') || undefined;
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

  const result = await getNotifications({ userId, limit, cursor, unreadOnly });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action === 'mark-all-read') {
    const userId = body.user_id || 'default-user';
    const updated = await markAllRead(userId);
    return NextResponse.json({ ok: true, updated });
  }

  // create notification
  const user_id = body.user_id || 'default-user';
  const type = body.type || 'custom';
  const message = body.message || '';
  const metadata = body.metadata || null;
  const id = (globalThis as any).crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
  const created = await createNotification({ id, user_id, type, message, metadata });
  return NextResponse.json({ ok: true, notification: created });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = body.user_id || 'default-user';
  const id = body.id;
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  const updated = await markAsRead(userId, id);
  return NextResponse.json({ ok: true, updated });
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
