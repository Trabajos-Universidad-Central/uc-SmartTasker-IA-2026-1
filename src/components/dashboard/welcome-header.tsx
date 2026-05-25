'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function WelcomeHeader() {
  const [greeting, setGreeting] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Buenos días';
      if (hour < 18) return 'Buenas tardes';
      return 'Buenas noches';
    };
    setGreeting(getGreeting());
  }, []);

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName =
    fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Estudiante';

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {greeting ? `${greeting}, ${firstName}!` : `Hola, ${firstName}!`}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm sm:text-base">
        Aquí tienes un resumen de tu actividad.
      </p>
    </div>
  );
}
