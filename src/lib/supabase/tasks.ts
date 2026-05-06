import { createClient } from './client';
import type { EventFormValues } from '@/lib/types';
import { formatDateToYYYYMMDD, parseLocalDate } from '@/lib/date';

export interface StoredTask extends EventFormValues {
  id: string;
  user_id?: string;
  event_id?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  due_date?: string; // YYYY-MM-DD
  due_time?: string; // HH:MM
  date?: string | Date;
  horaInicio?: string;
  horaFin?: string;
  status?:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'not-started'
    | 'in-progress';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  event_id?: string;
}

const formStatusToDbStatus: Record<
  'pending' | 'in_progress' | 'completed' | 'cancelled' | 'not-started' | 'in-progress',
  'pending' | 'in_progress' | 'completed' | 'cancelled'
> = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  'not-started': 'pending',
  'in-progress': 'in_progress',
};

function normalizeTaskStatus(
  status: TaskInput['status'] | undefined,
): 'pending' | 'in_progress' | 'completed' | 'cancelled' {
  if (!status) return 'pending';
  return formStatusToDbStatus[status] ?? 'pending';
}

function resolveDueDate(task: Partial<TaskInput>): string | null {
  if (task.due_date) return task.due_date;
  return formatDateToYYYYMMDD(task.date);
}

function resolveDueTime(task: Partial<TaskInput>): string | null {
  if (task.due_time) return task.due_time;
  return task.horaInicio || null;
}

/**
 * Convierte una fecha en cualquier formato a YYYY-MM-DD
 */

/**
 * Obtiene todas las tareas del usuario autenticado
 */
export async function getTasks(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data?.map(task => mapDatabaseTaskToFormValues(task)) || [];
}

/**
 * Crea una nueva tarea
 */
export async function createTask(userId: string, task: TaskInput) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        user_id: userId,
        title: task.title,
        description: task.description || null,
        due_date: resolveDueDate(task),
        due_time: resolveDueTime(task),
        status: normalizeTaskStatus(task.status),
        priority: task.priority || 'medium',
        category: task.category || null,
        event_id: task.event_id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return mapDatabaseTaskToFormValues(data);
}

/**
 * Actualiza una tarea existente
 */
export async function updateTask(userId: string, id: string, taskData: Partial<TaskInput>) {
  const supabase = createClient();

  const updatePayload: any = {
    updated_at: new Date().toISOString(),
  };

  if (taskData.title) updatePayload.title = taskData.title;
  if (taskData.description !== undefined) updatePayload.description = taskData.description || null;
  const dueDate = resolveDueDate(taskData);
  if (dueDate) updatePayload.due_date = dueDate;
  if (taskData.due_time !== undefined || taskData.horaInicio !== undefined)
    updatePayload.due_time = resolveDueTime(taskData);
  if (taskData.status) updatePayload.status = normalizeTaskStatus(taskData.status);
  if (taskData.priority) updatePayload.priority = taskData.priority;
  if (taskData.category !== undefined) updatePayload.category = taskData.category || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return mapDatabaseTaskToFormValues(data);
}

/**
 * Elimina una tarea
 */
export async function deleteTask(userId: string, id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  return mapDatabaseTaskToFormValues(data);
}

/**
 * Mapea una tarea de la base de datos a EventFormValues
 */
function mapDatabaseTaskToFormValues(dbTask: any): StoredTask {
  return {
    id: dbTask.id,
    user_id: dbTask.user_id,
    event_id: dbTask.event_id,
    title: dbTask.title,
    type: 'tarea',
    date: parseLocalDate(dbTask.due_date) ?? new Date(dbTask.due_date),
    description: dbTask.description || undefined,
    horaInicio: dbTask.due_time || undefined,
    status: mapTaskStatus(dbTask.status),
    priority: mapTaskPriority(dbTask.priority),
    fullDay: !dbTask.due_time,
  };
}

/**
 * Mapea el estado de la tarea en la BD al estado del formulario
 */
function mapTaskStatus(dbStatus: string): 'not-started' | 'in-progress' | 'completed' {
  const statusMap: Record<string, 'not-started' | 'in-progress' | 'completed'> = {
    'pending': 'not-started',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'cancelled': 'not-started',
  };
  return statusMap[dbStatus] || 'not-started';
}

/**
 * Mapea la prioridad de la tarea en la BD a la prioridad del formulario
 */
function mapTaskPriority(dbPriority: string): 'low' | 'medium' | 'high' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
  };
  return priorityMap[dbPriority] || 'medium';
}
