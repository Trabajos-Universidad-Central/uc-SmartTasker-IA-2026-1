import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0')
  const minute = index % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

export function formatTimeRange(event: {
  fullDay?: boolean
  horaInicio?: string
  horaFin?: string
}) {
  if (event.fullDay) {
    return 'Todo el día'
  }

  if (event.horaInicio && event.horaFin) {
    return `${event.horaInicio} – ${event.horaFin}`
  }

  if (event.horaInicio) {
    return event.horaInicio
  }

  if (event.horaFin) {
    return event.horaFin
  }

  return undefined
}
