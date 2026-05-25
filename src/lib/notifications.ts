import fs from 'fs/promises';
import path from 'path';

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  metadata?: Record<string, any> | null;
  is_read: boolean;
  created_at: string; // ISO
};

const FILE_PATH = path.join(process.cwd(), 'data', 'notifications.json');

async function readAll(): Promise<Notification[]> {
  try {
    const txt = await fs.readFile(FILE_PATH, 'utf-8');
    const data = JSON.parse(txt || '[]');
    if (!Array.isArray(data)) return [];
    return data as Notification[];
  } catch (err) {
    // If file not found, initialize
    if ((err as any).code === 'ENOENT') {
      await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
      await fs.writeFile(FILE_PATH, '[]', 'utf-8');
      return [];
    }
    throw err;
  }
}

async function writeAll(items: Notification[]) {
  await fs.writeFile(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

export async function getNotifications(opts: {
  userId: string;
  limit?: number;
  cursor?: string; // ISO string for created_at cursor (fetch older than)
  unreadOnly?: boolean;
}): Promise<{ items: Notification[]; nextCursor?: string; unreadCount: number }> {
  const { userId, limit = 20, cursor, unreadOnly = false } = opts;
  const all = await readAll();
  let items = all.filter((n) => n.user_id === userId);
  if (unreadOnly) items = items.filter((n) => n.is_read === false);
  // order desc
  items.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  if (cursor) {
    items = items.filter((n) => n.created_at < cursor);
  }
  const slice = items.slice(0, limit);
  const nextCursor = slice.length === limit ? slice[slice.length - 1].created_at : undefined;
  const unreadCount = all.filter((n) => n.user_id === userId && !n.is_read).length;
  return { items: slice, nextCursor, unreadCount };
}

export async function createNotification(payload: {
  id: string;
  user_id: string;
  type: string;
  message: string;
  metadata?: Record<string, any> | null;
}) {
  const all = await readAll();
  const now = new Date().toISOString();
  const item: Notification = {
    id: payload.id,
    user_id: payload.user_id,
    type: payload.type,
    message: payload.message,
    metadata: payload.metadata ?? null,
    is_read: false,
    created_at: now,
  };
  all.push(item);
  await writeAll(all);
  return item;
}

export async function markAsRead(userId: string, notificationId: string) {
  const all = await readAll();
  let updated = 0;
  for (const n of all) {
    if (n.id === notificationId && n.user_id === userId && !n.is_read) {
      n.is_read = true;
      updated++;
    }
  }
  if (updated > 0) await writeAll(all);
  return updated;
}

export async function markAllRead(userId: string) {
  const all = await readAll();
  let updated = 0;
  for (const n of all) {
    if (n.user_id === userId && !n.is_read) {
      n.is_read = true;
      updated++;
    }
  }
  if (updated > 0) await writeAll(all);
  return updated;
}

export async function deleteNotification(userId: string, notificationId: string) {
  const all = await readAll();
  const notificationToDelete = all.find(
    (notification) => notification.id === notificationId && notification.user_id === userId
  );

  if (!notificationToDelete) {
    return { deleted: 0, unreadRemoved: 0 };
  }

  const nextNotifications = all.filter((notification) => notification.id !== notificationId);
  await writeAll(nextNotifications);

  return {
    deleted: 1,
    unreadRemoved: notificationToDelete.is_read ? 0 : 1,
  };
}

export async function getUnreadCount(userId: string) {
  const all = await readAll();
  return all.filter((n) => n.user_id === userId && !n.is_read).length;
}
