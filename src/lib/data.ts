export type Task = {
  id: string;
  name: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffortHours: number;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'Clase' | 'Examen' | 'Estudio';
  color: string;
  iconColor: string;
};

export type Performance = {
  subject: string;
  grade: string;
  feedback?: string;
  notes?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  textColor: string;
};

export const pendingTasks: Task[] = [
  {
    id: '1',
    name: 'Ensayo sobre la Revolución Industrial',
    subject: 'Historia',
    dueDate: '2024-08-15',
    priority: 'high',
    estimatedEffortHours: 5,
  },
  {
    id: '2',
    name: 'Resolver set de problemas de cálculo',
    subject: 'Matemáticas',
    dueDate: '2024-08-12',
    priority: 'high',
    estimatedEffortHours: 4,
  },
  {
    id: '3',
    name: "Leer 'Cien Años de Soledad'",
    subject: 'Literatura',
    dueDate: '2024-08-20',
    priority: 'medium',
    estimatedEffortHours: 8,
  },
];

export const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Clase de Química Orgánica',
    date: 'Mañana',
    time: '10:00 AM',
    category: 'Clase',
    color: 'bg-card-blue',
    iconColor: 'text-card-blue-foreground',
  },
  {
    id: '2',
    title: 'Examen Parcial de Física',
    date: '2026-03-16',
    time: '2:00 PM',
    category: 'Examen',
    color: 'bg-card-pink',
    iconColor: 'text-card-pink-foreground',
  },
  {
    id: '3',
    title: 'Grupo de estudio para Álgebra',
    date: '2026-03-14',
    time: '4:00 PM',
    category: 'Estudio',
    color: 'bg-card-green',
    iconColor: 'text-card-green-foreground',
  },
];

export const performanceHistory: Performance[] = [
  {
    subject: 'Historia',
    grade: 'A-',
    notes: 'Me va bien con los ensayos, pero necesito mejorar en las fechas.',
  },
  {
    subject: 'Matemáticas',
    grade: 'B',
    feedback: 'Muestra dificultades en la resolución de integrales complejas.',
  },
  {
    subject: 'Literatura',
    grade: 'A',
    feedback: 'Excelente análisis literario y comprensión de los temas.',
  },
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Universidad',
    color: 'hsl(var(--card-blue))',
    textColor: 'hsl(var(--card-blue-foreground))',
  },
  {
    id: '2',
    name: 'Casa',
    color: 'hsl(var(--card-green))',
    textColor: 'hsl(var(--card-green-foreground))',
  },
  {
    id: '3',
    name: 'Trabajo',
    color: 'hsl(var(--card-pink))',
    textColor: 'hsl(var(--card-pink-foreground))',
  },
];
