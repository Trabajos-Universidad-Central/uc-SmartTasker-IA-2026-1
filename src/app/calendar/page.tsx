// src/app/calendar/page.tsx
import { Suspense } from 'react';
import CalendarContent from './CalendarContent';

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Cargando calendario...</div>}>
      <CalendarContent />
    </Suspense>
  );
}