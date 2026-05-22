// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { eventFormSchema } from '../lib/types'

// ═══════════════════════════════════════════════════════════════
//  CREACIÓN DE EVENTOS
//  Valida datos con el schema Zod real antes de guardar
// ═══════════════════════════════════════════════════════════════

vi.mock('../lib/events-store', () => ({
  createEvent: vi.fn(async (event: any) => event),
  getEvents:   vi.fn(async () => []),
  updateEvent: vi.fn(async (id: string, data: any) => ({ id, ...data })),
  deleteEvent: vi.fn(async (id: string) => ({ id })),
}))

const validEvent = {
  title: 'Parcial de Arquitectura',
  type: 'evento' as const,
  date: new Date('2026-06-15'),
  description: 'Tercer corte',
  horaInicio: '10:00',
  horaFin: '12:00',
  fullDay: false,
  priority: 'medium' as const,
}

// ─────────────────────────────────────────────────────────────
// 1. Validación Zod (eventFormSchema)
// ─────────────────────────────────────────────────────────────
describe('Validación de datos del evento (Zod schema)', () => {
  it('acepta un evento con todos los campos válidos', () => {
    const result = eventFormSchema.safeParse(validEvent)
    expect(result.success).toBe(true)
  })

  it('acepta evento sin descripción (campo opcional)', () => {
    const { description, ...noDesc } = validEvent
    expect(eventFormSchema.safeParse(noDesc).success).toBe(true)
  })

  it('rechaza título vacío', () => {
    const result = eventFormSchema.safeParse({ ...validEvent, title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('title')
  })

  it('rechaza título con menos de 3 caracteres', () => {
    expect(eventFormSchema.safeParse({ ...validEvent, title: 'AB' }).success).toBe(false)
  })

  it('rechaza type con valor no permitido ("reunion")', () => {
    const result = eventFormSchema.safeParse({ ...validEvent, type: 'reunion' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('type')
  })

  it('acepta type "tarea"', () => {
    expect(eventFormSchema.safeParse({ ...validEvent, type: 'tarea' }).success).toBe(true)
  })

  it('acepta type "recordatorio"', () => {
    expect(eventFormSchema.safeParse({ ...validEvent, type: 'recordatorio' }).success).toBe(true)
  })

  it('rechaza evento sin fecha', () => {
    const { date, ...noDate } = validEvent
    expect(eventFormSchema.safeParse(noDate).success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// 2. CRUD con mock del store
// ─────────────────────────────────────────────────────────────
describe('CRUD de eventos con store (mock)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('crea evento y devuelve el objeto guardado', async () => {
    const { createEvent } = await import('../lib/events-store')
    const stored = { id: 'evt-001', ...validEvent }
    vi.mocked(createEvent).mockResolvedValueOnce(stored)
    const result = await createEvent(stored)
    expect(result).toMatchObject({ id: 'evt-001', title: 'Parcial de Arquitectura' })
  })

  // it('lanza error si createEvent falla (simulando fallo de escritura)', async () => {
  //   const { createEvent } = await import('../lib/events-store')
  //   vi.mocked(createEvent).mockRejectedValueOnce(new Error('ENOSPC: disco lleno'))
  //   await expect(createEvent({ id: 'x', ...validEvent })).rejects.toThrow('ENOSPC')
  // })

  it('getEvents devuelve lista vacía cuando no hay eventos', async () => {
    const { getEvents } = await import('../lib/events-store')
    expect(await getEvents()).toEqual([])
  })

  it('updateEvent devuelve evento con título actualizado', async () => {
    const { updateEvent } = await import('../lib/events-store')
    vi.mocked(updateEvent).mockResolvedValueOnce({ id: 'evt-001', ...validEvent, title: 'Actualizado' })
    const result = await updateEvent('evt-001', { ...validEvent, title: 'Actualizado' })
    expect(result?.title).toBe('Actualizado')
  })

  it('deleteEvent devuelve el evento eliminado con su id', async () => {
    const { deleteEvent } = await import('../lib/events-store')
    vi.mocked(deleteEvent).mockResolvedValueOnce({ id: 'evt-001', ...validEvent })
    const result = await deleteEvent('evt-001')
    expect(result?.id).toBe('evt-001')
  })
})

// ─────────────────────────────────────────────────────────────
// 3. Medición de tiempo de validación
// ─────────────────────────────────────────────────────────────
describe('Medición de tiempo – validación de eventos', () => {
  it('validar un evento válido tarda menos de 5ms', () => {
    const start = performance.now()
    eventFormSchema.safeParse(validEvent)
    expect(performance.now() - start).toBeLessThan(5)
  })

  it('validar 500 eventos consecutivos tarda menos de 100ms', () => {
    const start = performance.now()
    for (let i = 0; i < 500; i++) eventFormSchema.safeParse(validEvent)
    expect(performance.now() - start).toBeLessThan(100)
  })

  it('validar evento inválido también termina en menos de 5ms', () => {
    const invalid = { ...validEvent, title: '', type: 'invalid' }
    const start = performance.now()
    eventFormSchema.safeParse(invalid)
    expect(performance.now() - start).toBeLessThan(5)
  })
})