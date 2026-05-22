// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent, updateEvent, deleteEvent, getEvents } from '../lib/supabase/events'
import type { EventFormValues } from '../lib/types'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockDbEvent, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockDbEvent, error: null }))
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockDbEvent, error: null }))
            }))
          }))
        }))
      }))
    }))
  }))
}))

const mockDbEvent = {
  id: '1',
  user_id: 'user123',
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2026-12-25',
  start_time: '10:00',
  end_time: '11:00',
  source: 'manual',
  is_confirmed: false,
  created_at: '2026-12-25T10:00:00Z',
  updated_at: '2026-12-25T10:00:00Z'
}

const mockEventForm: EventFormValues = {
  title: 'Test Event',
  type: 'evento',
  date: new Date('2026-05-25'),
  description: 'Test Description',
  horaInicio: '10:00',
  horaFin: '11:00',
  fullDay: false,
  priority: 'medium'
}

describe('Events Supabase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const result = await createEvent('user123', mockEventForm)
      expect(result).toBeDefined()
      expect(result.title).toBe('Test Event')
    })

    it('should throw error for invalid date', async () => {
      const invalidEvent = { ...mockEventForm, date: 'invalid' as any }
      await expect(createEvent('user123', invalidEvent)).rejects.toThrow('Invalid date format')
    })
  })

  describe('getEvents', () => {
    it('should return empty array when no events', async () => {
      const result = await getEvents('user123')
      expect(result).toEqual([])
    })
  })

  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      const result = await updateEvent('user123', '1', mockEventForm)
      expect(result).toBeDefined()
      expect(result.title).toBe('Test Event')
    })
  })

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      const result = await deleteEvent('user123', '1')
      expect(result).toBeDefined()
    })
  })
})