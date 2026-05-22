// src/test/setup.ts
// Setup mínimo — no importa @testing-library/react aquí porque jsdom@27
// tiene dependencias ESM que rompen el pool de threads en Windows.
// Los tests que necesiten matchers de jest-dom los importan ellos mismos.

import { afterEach } from 'vitest'

afterEach(() => {
  // cleanup() de @testing-library/react se llama por cada test
  // que use @vitest-environment jsdom e importe cleanup directamente
})