'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Settings,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendario' },
  { href: '/tasks', icon: CheckSquare, label: 'Tareas' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
];

function Logo() {
  return (
    <div className={cn('flex items-center gap-4 h-16 px-4')}>
      <Link
        href="/"
        className="group flex items-center justify-center h-14 w-14 bg-white/20 rounded-2xl text-primary-foreground transition-transform duration-300 hover:scale-105 shrink-0"
      >
        <BookOpen className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[-12deg]" />
      </Link>
      <span
        className={cn(
          'text-xl font-bold text-primary-foreground whitespace-nowrap'
        )}
      >
        SmartTasker
      </span>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col gap-y-4 p-3 bg-primary text-primary-foreground z-20 w-60'
      )}
    >
      <Logo />
      <nav className="flex flex-col items-stretch gap-y-2 w-full mt-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-12 items-center gap-3 rounded-lg transition-colors duration-200 px-4 justify-start',
                isActive
                  ? 'bg-black/20 font-medium'
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-black/10'
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
