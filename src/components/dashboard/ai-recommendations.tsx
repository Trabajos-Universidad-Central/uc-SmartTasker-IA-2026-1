'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AiRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAiAction = () => {
    // The user requested this button to lead to a new page or modal.
    // Since that's not implemented, we'll show a toast.
    setIsLoading(true);
    toast({
      title: 'Función en desarrollo',
      description: 'La creación de eventos con IA a partir de archivos estará disponible pronto.',
    });
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Acceso Rápido a IA</CardTitle>
        <CardDescription>
          Sube un archivo para crear eventos automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleAiAction}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir imagen o PDF para crear con IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
