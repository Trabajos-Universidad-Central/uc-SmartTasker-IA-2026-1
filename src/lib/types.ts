import * as z from 'zod';

export const eventFormSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, { message: 'El título debe tener al menos 3 caracteres.' }),
  type: z.enum(['evento', 'tarea', 'recordatorio']),
  date: z.date({
    required_error: 'La fecha es requerida.',
  }),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['not-started', 'in-progress', 'completed']).optional(),
  description: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
