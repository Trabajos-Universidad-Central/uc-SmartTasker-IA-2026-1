'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Upload, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/context/events-context';

interface ExtractedEvent {
  titulo: string | null;
  fecha: string | null;
  hora: string | null;
  descripcion: string | null;
}

export function AiRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedEvent, setExtractedEvent] = useState<ExtractedEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addEvent } = useEvents();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de archivo no válido',
        description: 'Por favor selecciona una imagen.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const response = await fetch('/api/extract-event', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error procesando la imagen');
      }

      const data: ExtractedEvent = await response.json();
      setExtractedEvent(data);
      setIsDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Hubo un error procesando la imagen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedEvent) return;

    // Convertir a formato del esquema
    const eventData = {
      title: extractedEvent.titulo || 'Evento sin título',
      type: 'evento' as const,
      date: extractedEvent.fecha ? new Date(extractedEvent.fecha) : new Date(),
      priority: 'medium' as const,
      description: extractedEvent.descripcion
        ? `${extractedEvent.descripcion}${extractedEvent.hora ? ` a las ${extractedEvent.hora}` : ''}`
        : extractedEvent.hora ? `A las ${extractedEvent.hora}` : undefined,
    };

    addEvent(eventData);
    setIsDialogOpen(false);
    setExtractedEvent(null);
    toast({
      title: 'Evento creado',
      description: 'El evento ha sido agregado exitosamente.',
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setExtractedEvent(null);
  };

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Acceso Rápido a IA</CardTitle>
          <CardDescription>
            Sube una imagen para crear eventos automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
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
                Subir imagen para crear con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Evento Extraído</DialogTitle>
            <DialogDescription>
              Revisa los datos extraídos de la imagen y confirma para crear el evento.
            </DialogDescription>
          </DialogHeader>
          {extractedEvent && (
            <div className="space-y-2">
              <p><strong>Título:</strong> {extractedEvent.titulo || 'No detectado'}</p>
              <p><strong>Fecha:</strong> {extractedEvent.fecha || 'No detectada'}</p>
              <p><strong>Hora:</strong> {extractedEvent.hora || 'No detectada'}</p>
              <p><strong>Descripción:</strong> {extractedEvent.descripcion || 'No detectada'}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              Confirmar y Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
