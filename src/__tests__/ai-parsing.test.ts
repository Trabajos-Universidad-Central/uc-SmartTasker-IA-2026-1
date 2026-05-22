// @vitest-environment node
import { describe, it, expect } from 'vitest'

// ═══════════════════════════════════════════════════════════════
//  PARSING DE RESPUESTA IA
//  Valida estructura JSON y limpieza de respuesta del modelo Gemini
// ═══════════════════════════════════════════════════════════════

// Función de limpieza 
function cleanAIResponse(raw: string): string {
  return raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
}

// Estructura esperada de la respuesta IA
interface AIEventResponse {
  titulo: string | null
  fecha: string | null
  hora: string | null
  descripcion: string | null
}

// Función de parseo completa
function parseAIEventResponse(raw: string): AIEventResponse {
  const cleaned = cleanAIResponse(raw)
  const parsed = JSON.parse(cleaned)
  return {
    titulo:      parsed.titulo      ?? null,
    fecha:       parsed.fecha       ?? null,
    hora:        parsed.hora        ?? null,
    descripcion: parsed.descripcion ?? null,
  }
}

// ─────────────────────────────────────────────────────────────
// 1. Limpieza de respuesta IA
// ─────────────────────────────────────────────────────────────
describe('Limpieza de respuesta IA', () => {
  it('elimina bloque ```json al inicio y cierre', () => {
    const raw = '```json\n{"titulo":"Reunión"}\n```'
    const result = cleanAIResponse(raw)
    expect(result).not.toContain('```json')
    expect(result).not.toContain('```')
  })

  it('elimina backticks sueltos sin tipo de lenguaje', () => {
    const raw = '```\n{"titulo":"Clase"}\n```'
    expect(cleanAIResponse(raw)).not.toContain('```')
  })

  it('no modifica JSON que ya está limpio', () => {
    const raw = '{"titulo":"Examen","fecha":"2026-06-01"}'
    expect(cleanAIResponse(raw)).toBe(raw)
  })

  it('elimina espacios y saltos de línea al inicio y fin', () => {
    const raw = '   {"titulo":"Test"}   '
    expect(cleanAIResponse(raw)).toBe('{"titulo":"Test"}')
  })
})

// ─────────────────────────────────────────────────────────────
// 2. Validación de estructura JSON
// ─────────────────────────────────────────────────────────────
describe('Validación de estructura JSON del evento IA', () => {
  it('parsea respuesta completa correctamente', () => {
    const raw = JSON.stringify({
      titulo: 'Parcial de Redes',
      fecha: '2026-06-15',
      hora: '08:00',
      descripcion: 'Parcial tercer corte',
    })
    const result = parseAIEventResponse(raw)
    expect(result.titulo).toBe('Parcial de Redes')
    expect(result.fecha).toBe('2026-06-15')
    expect(result.hora).toBe('08:00')
    expect(result.descripcion).toBe('Parcial tercer corte')
  })

  it('parsea respuesta dentro de bloque markdown ```json```', () => {
    const raw = '```json\n{"titulo":"Entrega","fecha":"2026-07-01","hora":null,"descripcion":null}\n```'
    const result = parseAIEventResponse(raw)
    expect(result.titulo).toBe('Entrega')
    expect(result.fecha).toBe('2026-07-01')
  })

  it('convierte campos ausentes a null (IA no siempre devuelve todos)', () => {
    const raw = JSON.stringify({ titulo: 'Evento sin hora' })
    const result = parseAIEventResponse(raw)
    expect(result.hora).toBeNull()
    expect(result.descripcion).toBeNull()
  })

  it('preserva null explícito devuelto por el modelo', () => {
    const raw = JSON.stringify({ titulo: null, fecha: null, hora: null, descripcion: null })
    const result = parseAIEventResponse(raw)
    expect(result.titulo).toBeNull()
    expect(result.fecha).toBeNull()
  })

  it('lanza SyntaxError si el JSON está malformado', () => {
    const raw = '{ titulo: "sin comillas" }'
    expect(() => parseAIEventResponse(raw)).toThrow(SyntaxError)
  })

  it('la respuesta parseada tiene exactamente las 4 claves requeridas', () => {
    const raw = JSON.stringify({
      titulo: 'Sustentación', fecha: '2026-11-20', hora: '14:00', descripcion: 'Proyecto final',
    })
    const result = parseAIEventResponse(raw)
    expect(Object.keys(result)).toEqual(['titulo', 'fecha', 'hora', 'descripcion'])
  })
})

// ─────────────────────────────────────────────────────────────
// 3. Medición de tiempo de parseo
// ─────────────────────────────────────────────────────────────
describe('Medición de tiempo – parseo de respuesta IA', () => {
  it('parseo de JSON limpio termina en menos de 5ms', () => {
    const raw = JSON.stringify({
      titulo: 'Evento', fecha: '2026-06-01', hora: '10:00', descripcion: 'Desc',
    })
    const start = performance.now()
    parseAIEventResponse(raw)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(5)
  })

  it('parseo con limpieza de markdown termina en menos de 10ms', () => {
    const raw = '```json\n{"titulo":"Clase","fecha":"2026-06-01","hora":"09:00","descripcion":"Intro"}\n```'
    const start = performance.now()
    parseAIEventResponse(raw)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10)
  })

  it('limpiar 1000 respuestas consecutivas tarda menos de 50ms en total', () => {
    const raw = '```json\n{"titulo":"Prueba","fecha":"2026-01-01","hora":"08:00","descripcion":"x"}\n```'
    const start = performance.now()
    for (let i = 0; i < 1000; i++) cleanAIResponse(raw)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(50)
  })
})