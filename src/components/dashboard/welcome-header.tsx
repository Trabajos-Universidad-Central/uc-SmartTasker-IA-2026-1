'use client';
import { useState, useEffect } from 'react';

export function WelcomeHeader() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Buenos días';
      if (hour < 18) return 'Buenas tardes';
      return 'Buenas noches';
    };
    setGreeting(getGreeting());
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting ? `${greeting}, Estudiante!` : `Hola, Estudiante!`}
      </h1>
      <p className="text-muted-foreground mt-1">
        Aquí tienes un resumen de tu actividad.
      </p>
    </div>
  );
}
