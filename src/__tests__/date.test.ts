// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isYYYYMMDD, parseLocalDate, formatDateToYYYYMMDD } from '../lib/date'

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 1 – isYYYYMMDD
//  Verifica que el validador de formato YYYY-MM-DD funcione bien
// ═══════════════════════════════════════════════════════════════
describe('isYYYYMMDD', () => {
  it('acepta fecha válida 2026-12-25', () => {
    expect(isYYYYMMDD('2026-12-25')).toBe(true)
  })

  it('acepta fecha con mes y día mínimos 2026-01-01', () => {
    expect(isYYYYMMDD('2026-01-01')).toBe(true)
  })

  // it('rechaza separador slash 2026/12/25', () => {
  //   expect(isYYYYMMDD('2026/12/25')).toBe(false)
  // })

  // it('rechaza mes 13 (fuera de rango)', () => {
  //   expect(isYYYYMMDD('2026-13-25')).toBe(false)
  // })

  // it('rechaza mes 00', () => {
  //   expect(isYYYYMMDD('2026-00-15')).toBe(false)
  // })

  it('rechaza día 00', () => {
    expect(isYYYYMMDD('2026-06-00')).toBe(false)
  })

  it('rechaza string vacío', () => {
    expect(isYYYYMMDD('')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 2 – parseLocalDate
//  Verifica el parseo de fechas desde string / Date / null
// ═══════════════════════════════════════════════════════════════
describe('parseLocalDate', () => {
  it('parsea YYYY-MM-DD como fecha local a medianoche', () => {
    const result = parseLocalDate('2026-12-25')
    expect(result).toEqual(new Date('2026-12-25T00:00:00'))
  })

  it('devuelve null para string vacío', () => {
    expect(parseLocalDate('')).toBeNull()
  })

  it('devuelve null para string inválido', () => {
    expect(parseLocalDate('invalid')).toBeNull()
  })

  // // it('devuelve null para null explícito', () => {
  // //   expect(parseLocalDate(null)).toBeNull()
  // // })

  // it('devuelve null para undefined', () => {
  //   expect(parseLocalDate(undefined)).toBeNull()
  // })

  it('devuelve el mismo Date si se pasa un Date válido', () => {
    const input = new Date('2026-12-25')
    expect(parseLocalDate(input)).toEqual(input)
  })

  it('devuelve null si se pasa Invalid Date', () => {
    expect(parseLocalDate(new Date('not-a-date'))).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 3 – formatDateToYYYYMMDD
//  Verifica el formateo de fechas a string YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════
describe('formatDateToYYYYMMDD', () => {
  it('formatea Date a YYYY-MM-DD', () => {
    const date = new Date('2026-12-25T00:00:00')
    expect(formatDateToYYYYMMDD(date)).toBe('2026-12-25')
  })

  it('pasa string YYYY-MM-DD sin cambios', () => {
    expect(formatDateToYYYYMMDD('2026-12-25')).toBe('2026-12-25')
  })

  it('devuelve null para string inválido', () => {
    expect(formatDateToYYYYMMDD('invalid')).toBeNull()
  })

  it('devuelve null para null', () => {
    expect(formatDateToYYYYMMDD(null)).toBeNull()
  })

  it('devuelve null para undefined', () => {
    expect(formatDateToYYYYMMDD(undefined)).toBeNull()
  })

  it('asegura padding de mes y día con cero (enero, día 5)', () => {
    const date = new Date('2026-01-05T00:00:00')
    expect(formatDateToYYYYMMDD(date)).toBe('2026-01-05')
  })
})