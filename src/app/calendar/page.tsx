'use client';

import { useState, useEffect } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckSquare,
  Bell,
  Pencil,
  Trash,
} from 'lucide-react';
import { useEvents, type EventWithId, type EventFormValues } from '@/context/events-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ScrollArea } from '@/components/ui/scroll-area';

const typeMap = {
  evento: { label: 'Evento', icon: <CalendarIcon className="w-4 h-4" /> },
  tarea: { label: 'Tarea', icon: <CheckSquare className="w-4 h-4" /> },
  recordatorio: {
    label: 'Recordatorio',
    icon: <Bell className="w-4 h-4" />,
  },
};

const priorityMap = {
  high: { label: 'Alta', variant: 'destructive' as const },
  medium: { label: 'Media', variant: 'accent' as const },
  low: { label: 'Baja', variant: 'secondary' as const },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, deleteEvent, updateEvent } = useEvents();

  const [viewingEvent, setViewingEvent] = useState<EventWithId | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<EventWithId | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (editingEvent) {
      form.reset(editingEvent);
    }
  }, [editingEvent, form]);

  function onEditSubmit(data: EventFormValues) {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      toast({
        title: '¡Elemento Actualizado!',
        description: `Se ha actualizado "${data.title}".`,
      });
      setEditingEvent(null);
    }
  }

  const startOfMonthVar = startOfMonth(currentDate);
  const endOfMonthVar = endOfMonth(currentDate);
  const startDate = startOfWeek(startOfMonthVar, { locale: es });
  const endDate = endOfWeek(endOfMonthVar, { locale: es });

  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getEventsForDay = (day: Date): EventWithId[] => {
    return events.filter((event) => isSameDay(event.date, day));
  };

  const handleEventClick = (event: EventWithId) => {
    setViewingEvent(event);
  };

  const handleEditClick = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      setViewingEvent(null);
    }
  };

  const handleDeleteClick = () => {
    if (viewingEvent) {
      deleteEvent(viewingEvent.id);
      toast({
        title: '¡Elemento Eliminado!',
        description: `Se ha eliminado "${viewingEvent.title}".`,
      });
      setViewingEvent(null);
    }
  };

  return (
    <>
      <div className="bg-card p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="rounded-full h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="rounded-full h-9 w-9"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground pb-2 border-b">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1 pt-2">
          {monthDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex flex-col items-start justify-start rounded-lg transition-colors text-sm p-2 border border-transparent h-full',
                  {
                    'text-muted-foreground/50': !isSameMonth(day, currentDate),
                    'hover:bg-accent/50': isSameMonth(day, currentDate),
                    'cursor-pointer': dayEvents.length > 0,
                  }
                )}
                onClick={() => dayEvents.length > 0 && setSelectedDay(day)}
              >
                <span
                  className={cn('self-start font-medium', {
                    'text-primary': isToday(day),
                  })}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex-1 w-full space-y-1 overflow-hidden text-xs mt-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Badge
                      key={event.id}
                      variant={
                        event.type === 'tarea' ? 'destructive' : 'secondary'
                      }
                      className="w-full text-left justify-start truncate cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.title}
                    </Badge>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-muted-foreground text-center">...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedDay} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eventos del {selectedDay && format(selectedDay, 'PPP', { locale: es })}</DialogTitle>
            <DialogDescription>
              Aquí tienes un resumen de tus eventos y tareas para este día.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] my-4 pr-3">
            <div className="space-y-3">
              {selectedDay &&
                getEventsForDay(selectedDay).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedDay(null);
                      handleEventClick(event);
                    }}
                  >
                    <div className="text-primary flex-shrink-0 mt-1">
                      {typeMap[event.type].icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{event.title}</p>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <span>{typeMap[event.type].label}</span>
                      </div>
                      {event.type === 'tarea' && event.priority && (
                         <Badge variant={priorityMap[event.priority].variant} className="mt-2">
                            {priorityMap[event.priority].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              {selectedDay && getEventsForDay(selectedDay).length === 0 && (
                 <p className="text-muted-foreground text-center py-10">No hay eventos para este día.</p>
              )}
            </div>
          </ScrollArea>
           <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDay(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingEvent}
        onOpenChange={(isOpen) => !isOpen && setViewingEvent(null)}
      >
        {viewingEvent && (
          <DialogContent>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="text-primary flex-shrink-0 mt-1">
                  {typeMap[viewingEvent.type].icon}
                </div>
                <div className="flex-1">
                  <DialogTitle>{viewingEvent.title}</DialogTitle>
                  <DialogDescription>
                    {typeMap[viewingEvent.type].label}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(viewingEvent.date, 'PPP', { locale: es })}</span>
              </div>
              {viewingEvent.type === 'tarea' && viewingEvent.priority && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Prioridad:
                  </span>
                  <Badge variant={priorityMap[viewingEvent.priority].variant}>
                    {priorityMap[viewingEvent.priority].label}
                  </Badge>
                </div>
              )}
              {viewingEvent.description && (
                <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-md">
                  {viewingEvent.description}
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setViewingEvent(null)}>
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
        open={!!editingEvent}
        onOpenChange={(isOpen) => !isOpen && setEditingEvent(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar elemento</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu evento, tarea o recordatorio.
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
                      <Input placeholder="Ej: Examen de cálculo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="evento">Evento</SelectItem>
                          <SelectItem value="tarea">Tarea</SelectItem>
                          <SelectItem value="recordatorio">
                            Recordatorio
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
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
              </div>

              {form.watch('type') === 'tarea' && (
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
              )}

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
                  onClick={() => setEditingEvent(null)}
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
