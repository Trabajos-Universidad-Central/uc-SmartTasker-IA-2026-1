'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { es } from 'date-fns/locale';
import { eventFormSchema, type EventFormValues } from '@/lib/types';
import { useEvents } from '@/context/events-context';
import { TIME_OPTIONS } from '@/lib/utils';

export function QuickActions() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { addEvent } = useEvents();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      type: 'evento',
      fullDay: true,
      horaInicio: '',
      horaFin: '',
    },
  });

  const fullDay = form.watch('fullDay');

  function onSubmit(data: EventFormValues) {
    const eventData = {
      ...data,
      ...(data.fullDay
        ? { horaInicio: undefined, horaFin: undefined }
        : {
            horaInicio: data.horaInicio || undefined,
            horaFin: data.horaFin || undefined,
          }),
    };

    addEvent(eventData);
    toast({
      title: '¡Elemento Creado!',
      description: `Se ha creado "${data.title}" para el ${format(
        data.date,
        'PPP',
        { locale: es }
      )}.`,
    });
    form.reset({ title: '', type: 'evento', fullDay: true, horaInicio: '', horaFin: '' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Evento / Recordatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo elemento</DialogTitle>
          <DialogDescription>
            Añade una nueva tarea, evento o recordatorio a tu calendario.
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
                <div className="space-y-1">
                  <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Examen de cálculo" className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <div className="space-y-1">
                    <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="tarea">Tarea</SelectItem>
                        <SelectItem value="recordatorio">Recordatorio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <div className="space-y-1 flex flex-col justify-end">
                    <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Fecha</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            field.onChange(new Date(e.target.value + 'T00:00:00'));
                          } else {
                            field.onChange(null);
                          }
                        }}
                        ref={field.ref}
                        name={field.name}
                        onBlur={field.onBlur}
                        className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
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
                checked={fullDay}
                onCheckedChange={(checked) => {
                  form.setValue('fullDay', checked)
                  if (checked) {
                    form.setValue('horaInicio', '')
                    form.setValue('horaFin', '')
                  }
                }}
              />
            </div>

            {!fullDay && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="horaInicio"
                  render={({ field }) => (
                    <div className="space-y-1">
                      <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Hora inicio</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50">
                              <SelectValue placeholder="Selecciona inicio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  )}
                />
                <FormField
                  control={form.control}
                  name="horaFin"
                  render={({ field }) => (
                    <div className="space-y-1">
                      <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Hora fin</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50">
                              <SelectValue placeholder="Selecciona fin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  )}
                />
              </div>
            )}

            {form.watch('type') === 'tarea' && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <div className="space-y-1">
                    <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Prioridad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50">
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
                  </div>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <div className="space-y-1">
                  <FormLabel className="mb-1 block text-sm font-medium text-slate-700">Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade más detalles..."
                      className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
