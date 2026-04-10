'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEvents, type EventFormValues, type EventWithId } from '@/context/events-context';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const priorityMap = {
  high: { label: 'Alta', variant: 'destructive' as const },
  medium: { label: 'Media', variant: 'accent' as const },
  low: { label: 'Baja', variant: 'secondary' as const },
};

type Task = EventWithId & { type: 'tarea' };

export function PendingTasks() {
  const { events, updateEvent, deleteEvent } = useEvents();
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (editingTask) {
      form.reset(editingTask);
    }
  }, [editingTask, form]);

  function onEditSubmit(data: EventFormValues) {
    if (editingTask) {
      updateEvent(editingTask.id, data);
      toast({
        title: '¡Tarea Actualizada!',
        description: `Se ha actualizado "${data.title}".`,
      });
      setEditingTask(null);
    }
  }

  const handleDeleteClick = () => {
    if (viewingTask) {
      deleteEvent(viewingTask.id);
      toast({
        title: '¡Tarea Eliminada!',
        description: `Se ha eliminado la tarea "${viewingTask.title}".`,
      });
      setViewingTask(null);
    }
  };

  const handleEditClick = () => {
    if (viewingTask) {
      setEditingTask(viewingTask);
      setViewingTask(null);
    }
  };

  const pendingTasks = useMemo(
    () =>
      events.filter(
        (event): event is Task =>
          event.type === 'tarea' && event.status !== 'completed'
      ),
    [events]
  );

  const handleTaskCompletion = (task: Task, completed: boolean) => {
    updateEvent(task.id, {
      ...task,
      status: completed ? 'completed' : 'in-progress',
    });
  };

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Tareas Pendientes</CardTitle>
          <CardDescription>
            Completa tus tareas para mantenerte al día.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center p-3 rounded-lg border transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      className="mr-4"
                      checked={task.status === 'completed'}
                      onCheckedChange={(checked) => {
                        handleTaskCompletion(task, !!checked);
                      }}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`task-${task.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {task.title}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Vence: {format(task.date, 'PPP', { locale: es })}
                      </p>
                    </div>
                    {task.priority && (
                      <Badge variant={priorityMap[task.priority].variant}>
                        {priorityMap[task.priority].label}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => setViewingTask(task)}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                No tienes tareas pendientes. ¡Buen trabajo!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!viewingTask}
        onOpenChange={(isOpen) => !isOpen && setViewingTask(null)}
      >
        {viewingTask && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewingTask.title}</DialogTitle>
              <DialogDescription>Detalles de la Tarea</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(viewingTask.date, 'PPP', { locale: es })}</span>
              </div>
              {viewingTask.priority && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Prioridad:
                  </span>
                  <Badge variant={priorityMap[viewingTask.priority].variant}>
                    {priorityMap[viewingTask.priority].label}
                  </Badge>
                </div>
              )}
              {viewingTask.description && (
                <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-md">
                  {viewingTask.description}
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setViewingTask(null)}>
                  Cerrar
                </Button>
                <Button onClick={handleEditClick}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu tarea.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una prioridad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                              Baja
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              Media
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-red-500" />
                              Alta
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="not-started">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-gray-400" />
                              Sin empezar
                            </div>
                          </SelectItem>
                          <SelectItem value="in-progress">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-yellow-500" />
                              En proceso
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Completado
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? format(field.value, 'yyyy-MM-dd')
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              field.onChange(
                                new Date(e.target.value + 'T00:00:00')
                              );
                            } else {
                              field.onChange(null);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Añade más detalles..."
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingTask(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
