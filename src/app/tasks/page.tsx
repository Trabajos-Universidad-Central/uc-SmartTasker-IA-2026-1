'use client';

import { useState, useEffect, useMemo } from 'react';
import { useEvents, type EventFormValues } from '@/context/events-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Search,
  Pencil,
  Trash,
  ListFilter,
  MoreHorizontal,
  Eye,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const priorityMap = {
  high: { label: 'Alta', variant: 'destructive' as const },
  medium: { label: 'Media', variant: 'accent' as const },
  low: { label: 'Baja', variant: 'secondary' as const },
};

const statusMap: Record<
  'not-started' | 'in-progress' | 'completed',
  { label: string; className: string }
> = {
  'not-started': {
    label: 'Sin empezar',
    className: 'bg-muted/80 text-muted-foreground border-transparent',
  },
  'in-progress': {
    label: 'En proceso',
    className: 'bg-card-yellow text-card-yellow-foreground border-transparent',
  },
  completed: {
    label: 'Completado',
    className: 'bg-card-green text-card-green-foreground border-transparent',
  },
};

type Task = EventFormValues & { type: 'tarea' };

export default function TasksPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const tasks = useMemo(
    () => events.filter((event): event is Task => event.type === 'tarea'),
    [events]
  );

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (task) =>
          priorityFilter.length === 0 ||
          (task.priority && priorityFilter.includes(task.priority))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, searchTerm, priorityFilter]);

  const addForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      type: 'tarea',
      priority: 'medium',
      status: 'not-started',
    },
  });

  const editForm = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
  });

  useEffect(() => {
    if (editingTask) {
      editForm.reset(editingTask);
    }
  }, [editingTask, editForm]);

  const handleAddTask = (data: EventFormValues) => {
    addEvent({ ...data, type: 'tarea' });
    toast({
      title: '¡Tarea Creada!',
      description: `Se ha creado la tarea "${data.title}".`,
    });
    addForm.reset({
      title: '',
      type: 'tarea',
      priority: 'medium',
      status: 'not-started',
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateTask = (data: EventFormValues) => {
    if (editingTask) {
      updateEvent(editingTask.id, { ...data, type: 'tarea' });
      toast({
        title: '¡Tarea Actualizada!',
        description: `Se ha actualizado la tarea "${data.title}".`,
      });
      setEditingTask(null);
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    deleteEvent(taskId);
    toast({
      title: '¡Tarea Eliminada!',
      description: `Se ha eliminado la tarea "${taskTitle}".`,
    });
  };

  const handleStatusChange = (
    task: Task,
    status: 'not-started' | 'in-progress' | 'completed'
  ) => {
    updateEvent(task.id, { ...task, status });
    toast({
      title: '¡Estado Actualizado!',
      description: `El estado de la tarea "${task.title}" ha sido actualizado.`,
    });
  };
  
  const handleDeleteFromView = () => {
    if (viewingTask) {
      handleDeleteTask(viewingTask.id, viewingTask.title);
      setViewingTask(null);
    }
  };

  const handleEditFromView = () => {
    if (viewingTask) {
      setEditingTask(viewingTask);
      setViewingTask(null);
    }
  };


  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Tareas
            </h1>
            <p className="text-muted-foreground mt-1">
              Organiza, filtra y completa tus tareas pendientes.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir nueva tarea</DialogTitle>
                <DialogDescription>
                  Completa los detalles de tu nueva tarea.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(handleAddTask)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título de la tarea</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Preparar presentación"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                      control={addForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                    control={addForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Vencimiento</FormLabel>
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
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Añade más detalles..."
                            className="resize-none"
                            {...field}
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
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar Tarea</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Tareas</CardTitle>
            <CardDescription>
              Aquí puedes ver todas tus tareas pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar tareas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Filtrar por Prioridad
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Prioridad</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(priorityMap).map(([key, { label }]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={priorityFilter.includes(key)}
                      onCheckedChange={(checked) => {
                        setPriorityFilter((prev) =>
                          checked
                            ? [...prev, key]
                            : prev.filter((p) => p !== key)
                        );
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarea</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-start font-normal text-sm p-1 h-auto"
                              >
                                {task.status && statusMap[task.status] ? (
                                  <Badge
                                    className={cn(
                                      'w-full justify-center text-xs',
                                      statusMap[task.status].className
                                    )}
                                  >
                                    {statusMap[task.status].label}
                                  </Badge>
                                ) : (
                                  <span>-</span>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>
                                Cambiar estado
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {Object.entries(statusMap).map(
                                ([statusKey, statusValue]) => (
                                  <DropdownMenuItem
                                    key={statusKey}
                                    onClick={() =>
                                      handleStatusChange(
                                        task,
                                        statusKey as 'not-started' | 'in-progress' | 'completed'
                                      )
                                    }
                                  >
                                    {statusValue.label}
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          {task.priority && (
                            <Badge variant={priorityMap[task.priority].variant}>
                              {priorityMap[task.priority].label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(task.date, 'dd MMM, yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingTask(task)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTask(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteTask(task.id, task.title)
                            }
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron tareas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!editingTask}
        onOpenChange={(isOpen) => !isOpen && setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>
              Actualiza los detalles de tu tarea.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateTask)}
              className="space-y-4 py-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la tarea</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Preparar presentación"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento</FormLabel>
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
                control={editForm.control}
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                {viewingTask.status && statusMap[viewingTask.status] ? (
                  <Badge
                    className={cn(
                      'text-xs',
                      statusMap[viewingTask.status].className
                    )}
                  >
                    {statusMap[viewingTask.status].label}
                  </Badge>
                ) : (
                  <span>-</span>
                )}
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
              <Button variant="destructive" onClick={handleDeleteFromView}>
                <Trash className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setViewingTask(null)}>
                  Cerrar
                </Button>
                <Button onClick={handleEditFromView}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
