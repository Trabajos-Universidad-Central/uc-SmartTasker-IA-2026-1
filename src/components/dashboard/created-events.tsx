'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Tag,
  CheckSquare,
  Bell,
  Pencil,
  Trash,
  Eye,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEvents, type EventFormValues, type EventWithId } from '@/context/events-context';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { TIME_OPTIONS, formatTimeRange } from '@/lib/utils';

const typeMap = {
  evento: { label: 'Evento', icon: <Calendar className="w-4 h-4" /> },
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

export function CreatedEvents() {
  const { events, deleteEvent, updateEvent } = useEvents();
  const [editingEvent, setEditingEvent] = useState<EventWithId | null>(
    null
  );
  const [viewingEvent, setViewingEvent] = useState<EventWithId | null>(
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

  function onSubmit(data: EventFormValues) {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
      toast({
        title: '¡Elemento Actualizado!',
        description: `Se ha actualizado "${data.title}".`,
      });
      setEditingEvent(null);
    }
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Eventos Creados</CardTitle>
          <CardDescription>
            Aquí están los elementos que has añadido recientemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="text-primary flex-shrink-0 mt-1">
                  {typeMap[event.type].icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium leading-tight">{event.title}</p>
                    {event.type === 'tarea' && event.priority && (
                      <Badge variant={priorityMap[event.priority].variant}>
                        {priorityMap[event.priority].label}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Tag className="w-3 h-3" />
                    <span>{typeMap[event.type].label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(event.date, 'PPP', { locale: es })}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span>{formatTimeRange(event) ?? 'Sin horario'}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-4 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setViewingEvent(event)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash className="w-3.5 h-3.5 mr-1.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <Calendar className="w-4 h-4" />
                <span>
                  {format(viewingEvent.date, 'PPP', { locale: es })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRange(viewingEvent) ?? 'Sin horario'}</span>
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
              <Button variant="destructive" onClick={() => {
                deleteEvent(viewingEvent.id);
                setViewingEvent(null);
              }}>
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setViewingEvent(null)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  setEditingEvent(viewingEvent);
                  setViewingEvent(null);
                }}>
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
              onSubmit={form.handleSubmit(onSubmit)}
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

              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Todo el día</p>
                  <p className="text-sm text-slate-500">
                    Marca esta opción si el evento no necesita hora.
                  </p>
                </div>
                <Switch
                  checked={form.watch('fullDay') ?? false}
                  onCheckedChange={(checked) =>
                    form.setValue('fullDay', checked)
                  }
                />
              </div>

              {!form.watch('fullDay') && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora inicio</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 bg-slate-50 focus:border-violet-500 focus:ring-violet-500">
                              <SelectValue placeholder="Selecciona hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="horaFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora fin</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 bg-slate-50 focus:border-violet-500 focus:ring-violet-500">
                              <SelectValue placeholder="Selecciona hora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

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
