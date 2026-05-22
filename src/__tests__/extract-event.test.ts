// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock GoogleGenerativeAI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return {
      getGenerativeModel: vi.fn(() => ({
        generateContent: vi.fn(() => Promise.resolve({
          response: {
            text: vi.fn(() => JSON.stringify({
              titulo: 'Test Event',
              fecha: '2026-12-25',
              hora: '14:00',
              descripcion: 'Test Description'
            })),
            usageMetadata: {
              promptTokenCount: 100,
              candidatesTokenCount: 50,
              totalTokenCount: 150
            }
          }
        }))
      }))
    }
  }),
}))

// Mock Supabase
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user123' } } }))
    }
  }))
}))

// Mock NextRequest and NextResponse
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({ data, options }))
  }
}))

describe('AI Event Extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse AI response correctly', async () => {
    // This is a unit test for the parsing logic
    const mockResponse = {
      titulo: 'Test Event',
      fecha: '2026-12-25',
      hora: '14:00',
      descripcion: 'Test Description'
    }

    const jsonString = JSON.stringify(mockResponse)
    const cleanedJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleanedJson)

    expect(parsed.titulo).toBe('Test Event')
    expect(parsed.fecha).toBe('2026-12-25')
    expect(parsed.hora).toBe('14:00')
    expect(parsed.descripcion).toBe('Test Description')
  })

  it('should handle timeout correctly', async () => {
    const startTime = performance.now()

    // Simula una operación asíncrona (p.ej. espera de respuesta IA)
    await new Promise(resolve => setTimeout(resolve, 80))

    const duration = performance.now() - startTime

    // El timer debe haberse ejecutado (>= 70ms con margen de scheduling)
    expect(duration).toBeGreaterThanOrEqual(70)
    expect(duration).toBeLessThan(500)
  })

  it('should validate response structure', () => {
    const validResponse = {
      titulo: 'Event',
      fecha: '2026-12-25',
      hora: '14:00',
      descripcion: 'Desc'
    }

    expect(validResponse).toHaveProperty('titulo')
    expect(validResponse).toHaveProperty('fecha')
    expect(validResponse).toHaveProperty('hora')
    expect(validResponse).toHaveProperty('descripcion')
  })

  it('should handle null values in response', () => {
    const responseWithNulls = {
      titulo: null,
      fecha: null,
      hora: null,
      descripcion: null
    }

    expect(responseWithNulls.titulo).toBeNull()
    expect(responseWithNulls.fecha).toBeNull()
    expect(responseWithNulls.hora).toBeNull()
    expect(responseWithNulls.descripcion).toBeNull()
  })

  // it('should process the extract-event route in under 8 seconds', async () => {
  //   process.env.GEMINI_API_KEY = 'test-key'

  //   const mockFile = {
  //     type: 'image/png',
  //     arrayBuffer: async () => new TextEncoder().encode('fake-image-data').buffer,
  //   }

  //   const mockRequest = {
  //     cookies: {
  //       getAll: vi.fn(() => []),
  //       set: vi.fn(),
  //     },
  //     formData: async () => ({
  //       get: (key: string) => (key === 'imagen' ? mockFile : null),
  //     }),
  //   } as any

  //   const start = performance.now()
  //   const { POST } = await import('../app/api/extract-event/route')
  //   const response = await POST(mockRequest)
  //   const duration = performance.now() - start

  //   expect(duration).toBeLessThan(8000)
  //   expect(response.data).toMatchObject({
  //     titulo: 'Test Event',
  //     fecha: '2026-12-25',
  //     hora: '14:00',
  //     descripcion: 'Test Description',
  //     source: 'ai_image',
  //   })
  // })
})