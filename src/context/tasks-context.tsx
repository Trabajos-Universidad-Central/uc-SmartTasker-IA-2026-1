'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { EventFormValues } from '@/lib/types';
import { createUserNotification } from '@/lib/notifications-client';
import { parseLocalDate } from '@/lib/date';

export type TaskWithId = EventFormValues & { id: string };

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksContextType {
  tasks: TaskWithId[];
  addTask: (task: EventFormValues) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, taskData: EventFormValues) => Promise<void>;
  loading: boolean;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch('/api/tasks', { cache: 'no-store' });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Usuario no autenticado, no cargar tareas
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const json = await response.json();
        const serverTasks = Array.isArray(json.items)
          ? json.items.map((task: Omit<TaskWithId, 'date'> & { date: string }) => ({
              ...task,
              date: parseLocalDate(task.date) ?? new Date(task.date),
            }))
          : [];

        setTasks(serverTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  const addTask = async (task: EventFormValues) => {
    const newTask: TaskWithId = { ...task, id: crypto.randomUUID() };
    if (!newTask.status) {
      newTask.status = 'not-started';
    }

    // Optimistic update
    setTasks((prev) => [...prev, newTask]);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to save task');
      }

      const result = await response.json();

      // Actualizar con el ID real de la BD
      setTasks((prev) =>
        prev.map((t) => (t.id === newTask.id ? { ...result.item } : t))
      );

      await createUserNotification({
        action: 'created',
        entity: 'tarea',
        title: newTask.title,
        entityId: result.item?.id || newTask.id,
      }).catch((error) => {
        console.error('Error creating notification:', error);
      });
    } catch (error) {
      console.error('Error saving task:', error);
      // Remover la tarea si falló
      setTasks((prev) => prev.filter((t) => t.id !== newTask.id));
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id);

    // Optimistic update
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      if (taskToDelete) {
        await createUserNotification({
          action: 'deleted',
          entity: 'tarea',
          title: taskToDelete.title,
          entityId: id,
        }).catch((error) => {
          console.error('Error creating notification:', error);
        });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Restore la tarea si falló
      if (taskToDelete) {
        setTasks((prev) => [...prev, taskToDelete]);
      }
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: EventFormValues) => {
    const currentTask = tasks.find((task) => task.id === id);

    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...taskData, id } : task
      )
    );

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, taskData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await createUserNotification({
        action: 'updated',
        entity: 'tarea',
        title: taskData.title ?? currentTask.title,
        entityId: id,
      }).catch((error) => {
        console.error('Error creating notification:', error);
      });
    } catch (error) {
      console.error('Error updating task:', error);
      // Restore la tarea si falló
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? currentTask : task))
      );
      throw error;
    }
  };

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, deleteTask, updateTask, loading }}
    >
      {children}
    </TasksContext.Provider>
  );
}
