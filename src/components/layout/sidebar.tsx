'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Settings,
  BookOpen,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const mainNavItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar', icon: CalendarDays, label: 'Calendario' },
  { href: '/tasks', icon: CheckSquare, label: 'Tareas' },
];

const bottomNavItems = [
  { href: '/settings', icon: Settings, label: 'Configuración' },
];

function Logo() {
  return (
    <div className="flex items-center gap-3 h-16 px-4">
      <Link
        href="/"
        className="group flex items-center justify-center h-10 w-10 bg-white/20 rounded-xl text-primary-foreground transition-transform duration-300 hover:scale-105 shrink-0"
      >
        <BookOpen className="h-6 w-6 transition-transform duration-300 group-hover:rotate-[-12deg]" />
      </Link>
      <span className="text-xl font-bold text-primary-foreground whitespace-nowrap">
        SmartTasker
      </span>
    </div>
  );
}

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string };

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex h-12 items-center gap-3 rounded-lg transition-colors duration-200 px-4 justify-start',
        isActive
          ? 'bg-black/20 font-medium'
          : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-black/10'
      )}
    >
      <span className="flex items-center justify-center h-10 w-10 shrink-0">
        <item.icon className="h-6 w-6" />
      </span>
      <span className="whitespace-nowrap">{item.label}</span>
    </Link>
  );
  return onNavigate ? <SheetClose asChild>{link}</SheetClose> : link;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col flex-1 w-full mt-2">
      <nav className="flex flex-col items-stretch gap-y-3">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <nav className="flex flex-col items-stretch gap-y-3 mt-auto pt-3 border-t border-white/10">
        {bottomNavItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside
      className={cn(
        'hidden md:flex flex-col gap-y-4 p-3 bg-primary text-primary-foreground z-20 w-60'
      )}
    >
      <Logo />
      <NavLinks />
    </aside>
  );
}

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-primary text-primary-foreground p-3 w-60 border-none flex flex-col gap-y-4"
      >
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        <Logo />
        <NavLinks onNavigate={() => {}} />
      </SheetContent>
    </Sheet>
  );
}
