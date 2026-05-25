'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notifications } from '@/components/layout/notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import data from '@/lib/placeholder-images.json';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { MobileSidebarTrigger } from '@/components/layout/sidebar';

export function AppHeader() {
  const userAvatar = data.placeholderImages.find((p) => p.id === 'user-avatar');
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Mi Cuenta';
  const initial = (displayName?.[0] ?? 'U').toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="p-4 sm:px-6 lg:px-8 border-b flex items-center justify-end">
      <div className="flex items-center gap-4">
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
              <Avatar>
                <AvatarImage
                  src={userAvatar?.imageUrl}
                  alt="Avatar de usuario"
                  data-ai-hint={userAvatar?.imageHint}
                />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
