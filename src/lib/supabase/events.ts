import { createClient } from './client';
import type { EventFormValues } from '@/lib/types';
import { formatDateToYYYYMMDD, parseLocalDate } from '@/lib/date';

export interface StoredEvent extends EventFormValues {
  id: string;
  user_id?: string;
}

/**
 * Obtiene todos los eventos del usuario autenticado
 */
export async function getEvents(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data?.map(event => mapDatabaseEventToFormValues(event)) || [];
}

/**
 * Crea un nuevo evento
 */
export async function createEvent(userId: string, event: EventFormValues) {
  const supabase = createClient();

  const { title, description, date, horaInicio, horaFin } = event;
  const formattedDate = formatDateToYYYYMMDD(date);

  if (!formattedDate) {
    throw new Error('Invalid date format');
  }

  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        user_id: userId,
        title,
        description: description || null,
        start_date: formattedDate,
        start_time: horaInicio || null,
        end_time: horaFin || null,
        source: 'manual',
        is_confirmed: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return mapDatabaseEventToFormValues(data);
}

/**
 * Actualiza un evento existente
 */
export async function updateEvent(userId: string, id: string, eventData: EventFormValues) {
  const supabase = createClient();

  const { title, description, date, horaInicio, horaFin } = eventData;
  const formattedDate = formatDateToYYYYMMDD(date);

  if (!formattedDate) {
    throw new Error('Invalid date format');
  }

  const { data, error } = await supabase
    .from('events')
    .update({
      title,
      description: description || null,
      start_date: formattedDate,
      start_time: horaInicio || null,
      end_time: horaFin || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return mapDatabaseEventToFormValues(data);
}

/**
 * Elimina un evento
 */
export async function deleteEvent(userId: string, id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return mapDatabaseEventToFormValues(data);
}

/**
 * Mapea un evento de la base de datos a EventFormValues
 */
function mapDatabaseEventToFormValues(dbEvent: any): StoredEvent {
  const parsedDate = parseLocalDate(dbEvent.start_date);

  return {
    id: dbEvent.id,
    user_id: dbEvent.user_id,
    title: dbEvent.title,
    type: 'evento', // Por defecto, se puede ajustar según tus necesidades
    date: parsedDate ?? new Date(dbEvent.start_date),
    description: dbEvent.description || undefined,
    horaInicio: dbEvent.start_time || undefined,
    horaFin: dbEvent.end_time || undefined,
    fullDay: !dbEvent.start_time,
    priority: 'medium' as const, // Valor por defecto
  };
}
