type NotificationAction = 'created' | 'updated' | 'deleted';
type NotificationEntity = 'evento' | 'tarea' | 'recordatorio';

const DEFAULT_USER_ID = 'default-user';
const entityLabelMap: Record<NotificationEntity, string> = {
  evento: 'Evento',
  tarea: 'Tarea',
  recordatorio: 'Recordatorio',
};

function buildMessage(action: NotificationAction, entity: NotificationEntity, title?: string) {
  const label = entityLabelMap[entity] ?? 'Elemento';
  const safeTitle = title?.trim();

  if (action === 'created') {
    return safeTitle
      ? `${label} '${safeTitle}' creado correctamente`
      : `${label} creado correctamente`;
  }

  if (action === 'updated') {
    return safeTitle ? `${label} '${safeTitle}' actualizado` : `${label} actualizado`;
  }

  return safeTitle ? `${label} '${safeTitle}' eliminado` : `${label} eliminado`;
}

export async function createUserNotification(params: {
  action: NotificationAction;
  entity: NotificationEntity;
  title?: string;
  entityId?: string;
  userId?: string;
}) {
  const { action, entity, title, entityId, userId = DEFAULT_USER_ID } = params;

  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      type: `${entity}.${action}`,
      message: buildMessage(action, entity, title),
      metadata: entityId ? { event_id: entityId, entity } : { entity },
    }),
  });

  if (!response.ok) {
    throw new Error('No se pudo crear la notificación');
  }

  window.dispatchEvent(new Event('notifications:changed'));
}
