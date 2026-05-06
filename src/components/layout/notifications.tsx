"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

type NotificationItem = {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    event_id?: string;
    entity?: string;
  } | null;
};

export function Notifications() {
  const router = useRouter();
  const userId = 'default-user';
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?user_id=${userId}`);
      const json = await res.json();
      setItems(json.items || []);
      setUnread(json.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    let t: NodeJS.Timeout | undefined;

    const onNotificationsChanged = () => {
      void load();
    };

    window.addEventListener('notifications:changed', onNotificationsChanged);

    // Solo hacer polling cuando el dropdown está abierto
    if (open) {
      t = setInterval(() => load(), 30000);
    }

    return () => {
      if (t) clearInterval(t);
      window.removeEventListener('notifications:changed', onNotificationsChanged);
    };
  }, [open]);

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read', user_id: userId }),
    });
    await load();
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id: userId }),
    });
    setItems((s) => s.map((it) => (it.id === id ? { ...it, is_read: true } : it)));
    setUnread((u) => Math.max(0, u - 1));
  }

  async function openNotification(item: NotificationItem) {
    if (!item.is_read) {
      await markRead(item.id);
    }

    const eventId = item.metadata?.event_id;
    if (!eventId) {
      return;
    }

    setOpen(false);
    router.push(`/calendar?eventId=${encodeURIComponent(eventId)}`);
  }

  async function deleteItem(id: string, wasUnread: boolean) {
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id: userId }),
    });

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    if (wasUnread) {
      setUnread((currentUnread) => Math.max(0, currentUnread - 1));
    }
  }

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          // mark visible as read automatically
          if (unread > 0) markAllRead();
        }
      }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Notificaciones">
            <Bell className="h-6 w-6" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <strong>Notificaciones</strong>
            <button onClick={markAllRead} className="text-sm text-muted-foreground">Marcar todo leído</button>
          </div>
          <div className="max-h-64 overflow-auto">
            {items.length === 0 && !loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
            )}
            {items.map((it) => (
              <div
                key={it.id}
                className={`flex items-start gap-2 p-2 rounded-md hover:bg-muted ${it.is_read ? '' : 'bg-surface/60 font-semibold'}`}
              >
                <button
                  type="button"
                  className="flex-1 text-left cursor-pointer"
                  onClick={() => {
                    void openNotification(it);
                  }}
                >
                  <div className="text-sm">{it.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(it.created_at), { addSuffix: true })}
                  </div>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label="Eliminar notificación"
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteItem(it.id, !it.is_read);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
