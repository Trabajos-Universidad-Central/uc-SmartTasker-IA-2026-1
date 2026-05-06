"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { parseLocalDate } from '@/lib/date';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Check, X, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/context/events-context";
import { TIME_OPTIONS } from "@/lib/utils";

interface ExtractedEvent {
  titulo: string | null;
  fecha: string | null;
  hora: string | null;
  descripcion: string | null;
}

export function AiRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedEvent, setExtractedEvent] = useState<ExtractedEvent | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    titulo: "",
    fecha: "",
    fullDay: true,
    horaInicio: "",
    horaFin: "",
    descripcion: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addEvent } = useEvents();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor selecciona una imagen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("imagen", file);

    try {
      const response = await fetch("/api/extract-event", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error procesando la imagen");
      }

      const data: ExtractedEvent = await response.json();
      setExtractedEvent(data);
      setFormValues({
        titulo: data.titulo ?? "",
        fecha: data.fecha ?? "",
        fullDay: !data.hora,
        horaInicio: data.hora ?? "",
        horaFin: "",
        descripcion: data.descripcion ?? "",
      });
      setIsEditing(false);
      setIsDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Hubo un error procesando la imagen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedEvent) return;

    const parsedDate = parseLocalDate(formValues.fecha);
    const date = parsedDate ?? new Date();

    const descriptionParts = [];
    if (formValues.descripcion.trim()) {
      descriptionParts.push(formValues.descripcion.trim());
    }
    if (!formValues.fullDay && formValues.horaInicio.trim()) {
      const timeLabel = formValues.horaFin.trim()
        ? `${formValues.horaInicio.trim()} – ${formValues.horaFin.trim()}`
        : formValues.horaInicio.trim();
      descriptionParts.push(`Hora: ${timeLabel}`);
    }

    const eventData = {
      title: formValues.titulo.trim() || "Evento sin título",
      type: "evento" as const,
      date,
      priority: "medium" as const,
      fullDay: formValues.fullDay,
      horaInicio: formValues.fullDay
        ? undefined
        : formValues.horaInicio.trim() || undefined,
      horaFin: formValues.fullDay
        ? undefined
        : formValues.horaFin.trim() || undefined,
      description:
        descriptionParts.length > 0 ? descriptionParts.join(" ") : undefined,
    };

    addEvent(eventData);
    setIsDialogOpen(false);
    setExtractedEvent(null);
    setIsEditing(false);
    setFormValues({
      titulo: "",
      fecha: "",
      fullDay: true,
      horaInicio: "",
      horaFin: "",
      descripcion: "",
    });
    toast({
      title: "Evento creado",
      description: "El evento ha sido agregado exitosamente.",
    });
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setExtractedEvent(null);
    setIsEditing(false);
    setFormValues({
      titulo: "",
      fecha: "",
      fullDay: true,
      horaInicio: "",
      horaFin: "",
      descripcion: "",
    });
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
            style={{ display: "none" }}
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
              Revisa los datos extraídos de la imagen y confirma para crear el
              evento.
            </DialogDescription>
          </DialogHeader>
          {extractedEvent && (
            <div className="space-y-4">
              {!isEditing ? (
                <div className="space-y-2">
                  <p>
                    <strong>Título:</strong>{" "}
                    {extractedEvent.titulo || "No detectado"}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {extractedEvent.fecha || "No detectada"}
                  </p>
                  <p>
                    <strong>Hora:</strong>{" "}
                    {extractedEvent.hora || "No detectada"}
                  </p>
                  <p>
                    <strong>Descripción:</strong>{" "}
                    {extractedEvent.descripcion || "No detectada"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
                    <Input
                      value={formValues.titulo}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          titulo: event.target.value,
                        }))
                      }
                      placeholder="Ej: Reunión con el equipo"
                      className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
                    <Input
                      value={formValues.fecha}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          fecha: event.target.value,
                        }))
                      }
                      placeholder="YYYY-MM-DD o texto libre"
                      className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Todo el día</p>
                      <p className="text-sm text-slate-500">
                        Marca esta opción si el evento no necesita hora.
                      </p>
                    </div>
                    <Switch
                      checked={formValues.fullDay}
                      onCheckedChange={(checked) =>
                        setFormValues((current) => ({
                          ...current,
                          fullDay: checked,
                          horaInicio: checked ? "" : current.horaInicio,
                          horaFin: checked ? "" : current.horaFin,
                        }))
                      }
                    />
                  </div>

                  {!formValues.fullDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Hora inicio</label>
                        <Select
                          value={formValues.horaInicio}
                          onValueChange={(value) =>
                            setFormValues((current) => ({
                              ...current,
                              horaInicio: value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-slate-300 bg-slate-50 focus:border-violet-500 focus:ring-violet-500">
                            <SelectValue placeholder="Selecciona hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="mb-1 block text-sm font-medium text-slate-700">Hora fin</label>
                        <Select
                          value={formValues.horaFin}
                          onValueChange={(value) =>
                            setFormValues((current) => ({
                              ...current,
                              horaFin: value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-slate-300 bg-slate-50 focus:border-violet-500 focus:ring-violet-500">
                            <SelectValue placeholder="Selecciona hora" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
                    <Textarea
                      value={formValues.descripcion}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          descripcion: event.target.value,
                        }))
                      }
                      placeholder="Descripción del evento"
                      className="border-slate-300 focus:border-violet-500 focus:ring-violet-500 bg-slate-50 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex items-center gap-2">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="mr-auto border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 px-3"
              >
                ← Regresar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-500"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
