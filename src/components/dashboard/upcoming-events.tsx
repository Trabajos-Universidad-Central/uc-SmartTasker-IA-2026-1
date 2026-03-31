'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useEvents, type EventFormValues } from '@/context/events-context';
import {
  Calendar as CalendarIcon,
  Bell,
  CheckSquare,
  Eye,
  Pencil,
  Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isFuture, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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

const typeMap: Record<
  'evento' | 'recordatorio' | 'tarea',
  { icon: JSX.Element; label: string; color: string; iconColor: string }
> = {
  evento: {
    icon: <CalendarIcon className="w-5 h-5" />,
    label: 'Evento',
    color: 'bg-card-blue',
    iconColor: 'text-card-blue-foreground',
  },
  recordatorio: {
    icon: <Bell className="w-5 h-5" />,
    label: 'Recordatorio',
    color: 'bg-card-green',
    iconColor: 'text-card-green-foreground',
  },
  tarea: {
    icon: <CheckSquare className="w-5 h-5" />,
    label: 'Tarea',
    color: 'bg-card-pink',
    iconColor: 'text-card-pink-foreground',
  },
};

export function UpcomingEvents() {
  const { events, updateEvent, deleteEvent } = useEvents();
  const [viewingEvent, setViewingEvent] = useState<EventFormValues | null>(
    null
  );
  const [editingEvent, setEditingEvent] = useState<EventFormValues | null>(
    null
  );
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

  const handleEditClick = () => {
    if (viewingEvent) {
      setEditingEvent(viewingEvent);
      setViewingEvent(null);
    }
  };

  const upcomingEvents = useMemo(() => {
    return events
      .filter(
        (event) =>
          (event.type === 'evento' || event.type === 'recordatorio') &&
          (isToday(event.date) || isFuture(event.date))
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return `Hoy, ${format(date, "d 'de' MMMM", { locale: es })}`;
    }
    if (isTomorrow(date)) {
      return `Mañana, ${format(date, "d 'de' MMMM", { locale: es })}`;
    }
    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>
            Eventos y recordatorios para hoy y los próximos días.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const typeInfo = typeMap[event.type];
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        'p-3 rounded-lg flex items-start gap-3',
                        typeInfo.color
                      )}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center',
                          typeInfo.iconColor
                        )}
                      >
                        {typeInfo.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>{formatEventDate(event.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingEvent(event)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                No tienes eventos o recordatorios próximos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                <span>
                  {format(viewingEvent.date, 'PPP', { locale: es })}
                </span>
              </div>
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
              Modifica los detalles de tu evento o recordatorio.
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
