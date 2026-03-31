'use client';

import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export function MiniCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="rounded-lg shadow-sm flex flex-col h-full p-0">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="p-4 flex-1"
      />
    </Card>
  );
}
