# Plan de Pruebas — SmartTasker 2026

| Campo | Valor |
|-------|-------|
| **Proyecto** | SmartTasker — Asistente inteligente para gestión académica |
| **Versión del documento** | 1.0 |
| **Fecha** | 2026-05-01 |
| **Tipo de pruebas** | Manuales |
| **Entorno** | Desarrollo local (`http://localhost:9002`) |
| **Responsable** | Equipo SmartTasker |

---

## Tabla de contenido

1. Introducción
2. Objetivos
3. Alcance
4. Estrategia de pruebas
5. Recursos y entorno
6. Roles y responsabilidades
7. Cronograma de ejecución
8. Criterios de aceptación
9. Riesgos identificados
10. Casos de prueba (30 casos)
11. Plantilla de reporte de defectos
12. Anexo: matriz de trazabilidad

---

## 1. Introducción

Este documento describe la estrategia, el alcance y los casos de prueba manuales que serán ejecutados sobre la aplicación web **SmartTasker**. El objetivo es validar que las funcionalidades implementadas en el MVP cumplen con los requisitos definidos y se comportan correctamente bajo escenarios típicos y de borde.

SmartTasker es una aplicación web construida con **Next.js 15**, **React 19**, **TypeScript**, **Supabase Auth** para la autenticación, y **Google Gemini** para la extracción de información a partir de imágenes. Permite a los usuarios crear, editar, eliminar y visualizar **eventos**, **tareas** y **recordatorios** desde un panel centralizado.

---

## 2. Objetivos

### Objetivo general
Verificar que SmartTasker funciona de acuerdo con los requisitos funcionales y no funcionales definidos, asegurando una experiencia de usuario fluida, segura y libre de defectos críticos antes de la entrega final.

### Objetivos específicos
- Validar el correcto funcionamiento del **sistema de autenticación** (registro, inicio de sesión, cierre de sesión, cambio de contraseña).
- Comprobar el **CRUD completo** de eventos, tareas y recordatorios.
- Verificar la **protección de rutas** mediante el middleware de Next.js.
- Validar la **funcionalidad de extracción de eventos con IA** ante diferentes tipos de imágenes.
- Confirmar la correcta **visualización del calendario mensual** y la **lista de tareas** con filtros y búsqueda.
- Verificar la **responsividad** de la interfaz en distintos tamaños de pantalla.
- Detectar defectos antes de la entrega para que puedan ser corregidos.

---

## 3. Alcance

### 3.1 Funcionalidades incluidas en las pruebas
- Registro de nuevos usuarios.
- Inicio y cierre de sesión.
- Cambio de contraseña.
- Protección y redirección de rutas.
- Creación, edición, eliminación y visualización de eventos.
- Creación, edición, eliminación y visualización de tareas con prioridad y estado.
- Creación de recordatorios.
- Vista de calendario mensual.
- Filtrado y búsqueda en la lista de tareas.
- Extracción de eventos a partir de imágenes con IA (Google Gemini).
- Visualización de información de la cuenta del usuario.

### 3.2 Funcionalidades excluidas
- Recuperación de contraseña ("Olvidaste tu contraseña") — no implementada.
- Inicio de sesión con Google — no implementada.
- Notificaciones reales (campana del header es decorativa).
- Persistencia de eventos en base de datos — los eventos viven solo en memoria del navegador (limitación conocida).
- Despliegue en producción (Firebase App Hosting).
- Pruebas de carga / estrés / penetración.

---

## 4. Estrategia de pruebas

### 4.1 Tipo
Pruebas **manuales de caja negra**, ejecutadas por un tester siguiendo los pasos definidos en cada caso de prueba. No se utilizan herramientas de automatización en esta iteración.

### 4.2 Niveles
- **Pruebas funcionales:** verifican que cada funcionalidad cumple con su requisito.
- **Pruebas de integración:** verifican la interacción entre el frontend, Supabase y la API de Gemini.
- **Pruebas de UI/UX:** verifican que la interfaz responde correctamente a las acciones del usuario.
- **Pruebas de validación:** verifican que los formularios validen correctamente las entradas (Zod schemas).
- **Pruebas de seguridad básicas:** verifican la protección de rutas y el manejo de credenciales.

### 4.3 Técnicas
- **Particiones de equivalencia** (datos válidos vs inválidos).
- **Valores límite** (longitudes mínimas, máximas, vacíos).
- **Caminos felices y caminos alternativos** (errores esperados, datos ausentes).
- **Pruebas exploratorias** complementarias para detectar comportamientos no documentados.

---

## 5. Recursos y entorno

### 5.1 Entorno de pruebas
- **URL:** `http://localhost:9002`
- **Sistema operativo:** Windows 11 / macOS / Linux
- **Navegadores:** Google Chrome (última versión), Mozilla Firefox (última versión)
- **Resoluciones:** Desktop (1920×1080), Tablet (768×1024), Móvil (375×667)
- **Backend de autenticación:** Supabase (proyecto compartido del equipo)
- **Servicio de IA:** Google Gemini API (`gemini-2.5-flash` con fallback a `flash-lite` y `pro`)

### 5.2 Datos de prueba
- **Cuenta de prueba 1:** `tester1@smarttasker.test` / `Test1234!`
- **Cuenta de prueba 2:** `tester2@smarttasker.test` / `Test1234!`
- **Imágenes de prueba para IA:**
  - `imagen-horario.jpg` — fotografía clara de un horario académico.
  - `imagen-anuncio.png` — captura de pantalla de un anuncio de evento.
  - `imagen-borrosa.jpg` — imagen de baja calidad / ilegible.
  - `imagen-sin-texto.jpg` — imagen sin información textual (paisaje).
  - `archivo.pdf` — archivo no soportado (no es imagen).

### 5.3 Prerequisitos
- Aplicación corriendo localmente (`npm run dev`).
- Archivo `.env.local` correctamente configurado con `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Conexión a internet activa.

---

## 6. Roles y responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| **Tester** | Ejecutar los casos de prueba y registrar resultados. |
| **Líder de QA** | Definir el plan, priorizar casos, validar cobertura. |
| **Desarrollador** | Corregir defectos reportados, apoyar en la replicación. |
| **Product Owner** | Validar criterios de aceptación y aprobar la entrega final. |

---

## 7. Cronograma de ejecución

| Fase | Duración estimada |
|------|-------------------|
| Preparación del entorno | 0.5 día |
| Ejecución de casos de prueba | 2 días |
| Reporte de defectos | 0.5 día |
| Re-test tras correcciones | 1 día |
| Cierre y entrega del informe | 0.5 día |
| **Total** | **4.5 días** |

---

## 8. Criterios de aceptación

La entrega se considerará aprobada cuando:

- **100%** de los casos de prueba **críticos** (autenticación, CRUD de eventos, IA) hayan sido ejecutados.
- **≥ 95%** de los casos de prueba totales hayan sido ejecutados.
- **0 defectos críticos** abiertos (bloquean el flujo principal).
- **≤ 2 defectos mayores** abiertos (afectan funcionalidad pero tienen workaround).
- Los defectos menores (cosméticos) se documentarán pero no bloquean la entrega.

---

## 9. Riesgos identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|--------------|---------|------------|
| R-01 | La API de Gemini puede estar saturada (errores 503) | Media | Alto | Existe fallback automático a otros modelos en el código |
| R-02 | Pérdida de eventos al recargar (limitación conocida) | Alta | Medio | Documentar explícitamente la limitación; no es defecto |
| R-03 | El proyecto Supabase es compartido entre testers | Media | Bajo | Usar cuentas separadas para cada tester |
| R-04 | Variables de entorno mal configuradas | Baja | Alto | Verificar `.env.local` antes de empezar |
| R-05 | Diferencias de comportamiento entre navegadores | Baja | Medio | Probar al menos en Chrome y Firefox |

---

## 10. Casos de prueba

### Convenciones

- **ID:** prefijo según módulo (`AUTH`, `EVT`, `TSK`, `CAL`, `IA`, `CFG`).
- **Severidad:** Crítica / Alta / Media / Baja.
- **Tipo:** Funcional / Validación / UI / Integración / Seguridad.
- **Estado:** Pendiente / Aprobado / Fallido / Bloqueado.

### Estructura por caso

Cada caso contiene: ID, Título, Módulo, Tipo, Severidad, Precondiciones, Datos de prueba, Pasos, Resultado esperado, Resultado obtenido, Estado, Observaciones.

---

### MÓDULO: AUTENTICACIÓN (AUTH)

---

#### CP-AUTH-01 — Registro exitoso de un nuevo usuario

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario no autenticado, en la pantalla `/login`, pestaña "Crear cuenta" activa. |
| **Datos de prueba** | Nombre: `Juan Pérez`, Email: `juan.test@smarttasker.test`, Contraseña: `Pass1234`, Confirmar: `Pass1234` |
| **Pasos** | 1. Ingresar nombre completo. 2. Ingresar email válido. 3. Ingresar contraseña de 8 caracteres. 4. Confirmar contraseña. 5. Hacer click en "Crear cuenta". |
| **Resultado esperado** | El usuario es creado en Supabase, se muestra toast "¡Cuenta creada!" y se redirige automáticamente al dashboard (`/`). |
| **Resultado obtenido** | _A completar durante ejecución_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-02 — Registro con contraseña menor a 6 caracteres

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Usuario en pestaña "Crear cuenta". |
| **Datos de prueba** | Nombre: `Test`, Email: `corto@test.com`, Contraseña: `123`, Confirmar: `123` |
| **Pasos** | 1. Llenar formulario con contraseña de 3 caracteres. 2. Hacer click en "Crear cuenta". |
| **Resultado esperado** | El formulario muestra el mensaje "La contraseña debe tener al menos 6 caracteres" y no envía la solicitud. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-03 — Registro con contraseñas que no coinciden

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Usuario en pestaña "Crear cuenta". |
| **Datos de prueba** | Contraseña: `Pass1234`, Confirmar: `Pass5678` |
| **Pasos** | 1. Llenar todos los campos correctamente. 2. Ingresar contraseñas distintas. 3. Hacer click en "Crear cuenta". |
| **Resultado esperado** | Se muestra el mensaje "Las contraseñas no coinciden" debajo del campo confirmar. No se envía la solicitud. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-04 — Registro con email de formato inválido

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Usuario en pestaña "Crear cuenta". |
| **Datos de prueba** | Email: `correo-invalido` (sin @ ni dominio) |
| **Pasos** | 1. Llenar nombre y contraseñas. 2. Ingresar email mal formado. 3. Hacer click en "Crear cuenta". |
| **Resultado esperado** | Se muestra el mensaje "Correo electrónico inválido". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-05 — Login exitoso con credenciales correctas

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario previamente registrado. |
| **Datos de prueba** | Email: `tester1@smarttasker.test`, Contraseña: `Test1234!` |
| **Pasos** | 1. Acceder a `/login`. 2. Ingresar email y contraseña válidos. 3. Hacer click en "Entrar". |
| **Resultado esperado** | Se inicia sesión correctamente y se redirige al dashboard (`/`). El header muestra el avatar y nombre del usuario. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-06 — Login con credenciales incorrectas

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Funcional / Seguridad |
| **Severidad** | Crítica |
| **Precondiciones** | En pantalla `/login`. |
| **Datos de prueba** | Email: `tester1@smarttasker.test`, Contraseña: `WrongPass` |
| **Pasos** | 1. Ingresar email correcto. 2. Ingresar contraseña incorrecta. 3. Hacer click en "Entrar". |
| **Resultado esperado** | Se muestra toast destructivo "Correo o contraseña incorrectos". No se redirige. El usuario permanece en `/login`. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-07 — Cierre de sesión

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario autenticado en cualquier página. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Hacer click en el avatar del header (esquina superior derecha). 2. Hacer click en "Cerrar Sesión". |
| **Resultado esperado** | La sesión se cierra y se redirige a `/login`. Si se intenta navegar manualmente a `/` se redirige nuevamente a `/login`. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-08 — Acceso directo a ruta protegida sin sesión

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación / Seguridad |
| **Tipo** | Seguridad |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario sin sesión activa (cookies limpias). |
| **Datos de prueba** | URL: `http://localhost:9002/calendar` |
| **Pasos** | 1. Borrar cookies del navegador. 2. Acceder directamente a `/calendar` por la barra de direcciones. |
| **Resultado esperado** | El middleware redirige automáticamente a `/login`. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-AUTH-09 — Usuario autenticado intenta acceder a `/login`

| Campo | Detalle |
|-------|---------|
| **Módulo** | Autenticación |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Usuario con sesión activa. |
| **Datos de prueba** | URL: `http://localhost:9002/login` |
| **Pasos** | 1. Estando autenticado, escribir manualmente `/login` en la barra de direcciones. |
| **Resultado esperado** | El middleware redirige automáticamente al dashboard (`/`). |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

### MÓDULO: GESTIÓN DE EVENTOS (EVT)

---

#### CP-EVT-01 — Crear un evento manualmente con todos los campos

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario autenticado en el dashboard. |
| **Datos de prueba** | Título: `Reunión equipo`, Tipo: `Evento`, Fecha: fecha futura, FullDay: desactivado, HoraInicio: `14:00`, HoraFin: `15:30`, Descripción: `Reunión semanal` |
| **Pasos** | 1. Click en "Crear Evento / Recordatorio". 2. Llenar título. 3. Seleccionar tipo "Evento". 4. Seleccionar fecha. 5. Desactivar "Todo el día". 6. Seleccionar hora inicio y hora fin. 7. Escribir descripción. 8. Click en "Guardar". |
| **Resultado esperado** | Se cierra el modal, aparece un toast "¡Elemento Creado!" con la fecha. El evento aparece en la lista de "Próximos eventos" y en el calendario en la fecha seleccionada. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-02 — Crear un evento con título menor a 3 caracteres

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Modal "Crear nuevo elemento" abierto. |
| **Datos de prueba** | Título: `AB` |
| **Pasos** | 1. Ingresar título de 2 caracteres. 2. Llenar resto de campos válidos. 3. Click en "Guardar". |
| **Resultado esperado** | Mensaje de error "El título debe tener al menos 3 caracteres" debajo del campo. No se crea el evento. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-03 — Crear un evento sin fecha

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Modal "Crear nuevo elemento" abierto. |
| **Datos de prueba** | Título válido pero campo Fecha vacío |
| **Pasos** | 1. Llenar título. 2. Dejar fecha en blanco. 3. Click en "Guardar". |
| **Resultado esperado** | Mensaje "La fecha es requerida". No se crea el evento. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-04 — Crear un evento de "Todo el día"

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Modal abierto. |
| **Datos de prueba** | Título: `Festivo`, Tipo: `Evento`, Fecha: hoy, FullDay: activado |
| **Pasos** | 1. Llenar título y tipo. 2. Seleccionar fecha. 3. Activar el switch "Todo el día". 4. Verificar que los selectores de hora desaparezcan. 5. Click en "Guardar". |
| **Resultado esperado** | El evento se crea sin horas. Al verlo en el calendario o detalle, se muestra "Todo el día". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-05 — Editar un evento existente desde el calendario

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existe al menos un evento creado. Usuario en `/calendar`. |
| **Datos de prueba** | Cambiar título de un evento existente a `Título editado` |
| **Pasos** | 1. Hacer click sobre el badge del evento en la celda del calendario. 2. En el modal de detalle, click en "Editar". 3. Modificar el título. 4. Click en "Guardar Cambios". |
| **Resultado esperado** | Se cierra el modal de edición. Toast "¡Elemento Actualizado!". El evento muestra el nuevo título en el calendario. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-06 — Eliminar un evento desde el calendario

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existe al menos un evento creado. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Click en un evento en el calendario. 2. En el modal de detalle, click en "Eliminar". |
| **Resultado esperado** | El evento desaparece del calendario y de la lista de próximos eventos. Toast "¡Elemento Eliminado!". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-EVT-07 — Crear un recordatorio

| Campo | Detalle |
|-------|---------|
| **Módulo** | Eventos |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Modal "Crear nuevo elemento" abierto. |
| **Datos de prueba** | Título: `Llamar al médico`, Tipo: `Recordatorio`, Fecha: futura |
| **Pasos** | 1. Llenar título. 2. Seleccionar tipo "Recordatorio". 3. Seleccionar fecha. 4. Click en "Guardar". |
| **Resultado esperado** | El recordatorio se crea correctamente. Se diferencia visualmente del evento con icono distinto (campana). |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

### MÓDULO: GESTIÓN DE TAREAS (TSK)

---

#### CP-TSK-01 — Crear una tarea con prioridad y estado

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario en página `/tasks`. |
| **Datos de prueba** | Título: `Estudiar capítulo 5`, Prioridad: `Alta`, Estado: `En proceso`, Fecha: futura |
| **Pasos** | 1. Click en "Añadir Tarea". 2. Llenar título. 3. Seleccionar prioridad "Alta". 4. Seleccionar estado "En proceso". 5. Seleccionar fecha. 6. Click en "Guardar Tarea". |
| **Resultado esperado** | La tarea aparece en la tabla con su prioridad (badge rojo) y estado (badge amarillo). Toast "¡Tarea Creada!". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-TSK-02 — Cambiar el estado de una tarea desde la tabla

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existe al menos una tarea con estado "Sin empezar". |
| **Datos de prueba** | Cambiar estado a "Completado" |
| **Pasos** | 1. En la tabla de tareas, hacer click en el badge de estado de una tarea. 2. Seleccionar "Completado" del dropdown. |
| **Resultado esperado** | El estado de la tarea cambia inmediatamente y se refleja con badge verde. Toast "¡Estado Actualizado!". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-TSK-03 — Buscar una tarea por título

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Existen al menos 3 tareas con títulos diferentes (ej. "Estudiar matemáticas", "Comprar libros", "Estudiar física"). |
| **Datos de prueba** | Búsqueda: `estudiar` |
| **Pasos** | 1. En el campo de búsqueda, escribir "estudiar". |
| **Resultado esperado** | Solo se muestran las tareas cuyo título contiene "estudiar" (case-insensitive). Las demás se ocultan. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-TSK-04 — Filtrar tareas por prioridad

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Existen tareas con distintas prioridades (alta, media, baja). |
| **Datos de prueba** | Filtro: solo "Alta" |
| **Pasos** | 1. Click en "Filtrar por Prioridad". 2. Marcar checkbox "Alta". |
| **Resultado esperado** | Solo se muestran las tareas con prioridad alta. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-TSK-05 — Editar una tarea existente

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existe al menos una tarea. |
| **Datos de prueba** | Modificar título y prioridad |
| **Pasos** | 1. Click en el icono de lápiz (Editar) de una tarea. 2. Modificar título y cambiar prioridad. 3. Click en "Guardar Cambios". |
| **Resultado esperado** | La tarea se actualiza en la tabla. Toast "¡Tarea Actualizada!". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-TSK-06 — Eliminar una tarea

| Campo | Detalle |
|-------|---------|
| **Módulo** | Tareas |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existe al menos una tarea. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Click en el icono de papelera (Eliminar) de una tarea. |
| **Resultado esperado** | La tarea desaparece de la tabla. Toast "¡Tarea Eliminada!". |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

### MÓDULO: CALENDARIO (CAL)

---

#### CP-CAL-01 — Navegar al mes siguiente y anterior

| Campo | Detalle |
|-------|---------|
| **Módulo** | Calendario |
| **Tipo** | UI / Funcional |
| **Severidad** | Media |
| **Precondiciones** | Usuario en `/calendar`. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Anotar el mes/año actualmente mostrado. 2. Click en flecha derecha. 3. Verificar que avanza un mes. 4. Click en flecha izquierda dos veces. 5. Verificar que retrocede al mes anterior al inicial. |
| **Resultado esperado** | El título del mes se actualiza correctamente y los días mostrados corresponden al mes seleccionado. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-CAL-02 — Ver eventos de un día específico

| Campo | Detalle |
|-------|---------|
| **Módulo** | Calendario |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Existen 3 o más eventos en un mismo día. |
| **Datos de prueba** | Día con múltiples eventos |
| **Pasos** | 1. Hacer click en la celda del día (no en un badge específico). |
| **Resultado esperado** | Se abre un modal listando todos los eventos del día con su tipo, título y prioridad si aplica. Si hay más de 2 eventos, en la celda se muestra "..." indicando que hay más. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-CAL-03 — El día actual se resalta visualmente

| Campo | Detalle |
|-------|---------|
| **Módulo** | Calendario |
| **Tipo** | UI |
| **Severidad** | Baja |
| **Precondiciones** | Usuario en `/calendar`. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Verificar el mes actual. 2. Localizar la celda del día actual. |
| **Resultado esperado** | El número del día actual aparece en color violeta (primary), diferenciándose del resto. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

### MÓDULO: INTELIGENCIA ARTIFICIAL (IA)

---

#### CP-IA-01 — Extraer evento desde imagen clara

| Campo | Detalle |
|-------|---------|
| **Módulo** | IA |
| **Tipo** | Integración / Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario autenticado en el dashboard. `GEMINI_API_KEY` configurada. |
| **Datos de prueba** | Archivo: `imagen-horario.jpg` (foto clara con fecha y hora visibles) |
| **Pasos** | 1. En la card "Acceso Rápido a IA", click en "Subir imagen para crear con IA". 2. Seleccionar `imagen-horario.jpg`. 3. Esperar a que termine el procesamiento (botón muestra "Procesando..."). |
| **Resultado esperado** | Se abre el modal "Confirmar Evento Extraído" mostrando título, fecha, hora y descripción extraídos correctamente de la imagen. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-IA-02 — Confirmar evento extraído sin editar

| Campo | Detalle |
|-------|---------|
| **Módulo** | IA |
| **Tipo** | Funcional |
| **Severidad** | Crítica |
| **Precondiciones** | El paso CP-IA-01 fue exitoso y el modal está abierto. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Sin modificar nada, hacer click en "Confirmar". |
| **Resultado esperado** | Se cierra el modal. Toast "Evento creado". El evento aparece en la lista de próximos eventos y en el calendario en la fecha extraída. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-IA-03 — Editar datos del evento extraído antes de confirmar

| Campo | Detalle |
|-------|---------|
| **Módulo** | IA |
| **Tipo** | Funcional |
| **Severidad** | Alta |
| **Precondiciones** | Modal de confirmación de evento extraído abierto. |
| **Datos de prueba** | Modificar título a `Título corregido` |
| **Pasos** | 1. Click en "Editar". 2. Modificar el título. 3. Click en "Confirmar". |
| **Resultado esperado** | El evento se crea con el título modificado, no con el original extraído por la IA. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-IA-04 — Subir un archivo que no es imagen

| Campo | Detalle |
|-------|---------|
| **Módulo** | IA |
| **Tipo** | Validación |
| **Severidad** | Alta |
| **Precondiciones** | Usuario en el dashboard. |
| **Datos de prueba** | Archivo: `archivo.pdf` |
| **Pasos** | 1. Click en "Subir imagen para crear con IA". 2. Forzar la selección de un PDF (cambiando el filtro del selector si es necesario). |
| **Resultado esperado** | Toast destructivo "Tipo de archivo no válido — Por favor selecciona una imagen". No se hace petición al servidor. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-IA-05 — Cancelar el evento extraído

| Campo | Detalle |
|-------|---------|
| **Módulo** | IA |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Modal de confirmación de evento extraído abierto. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Click en "Cancelar". |
| **Resultado esperado** | Se cierra el modal y NO se crea ningún evento en el sistema. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

### MÓDULO: CONFIGURACIÓN (CFG)

---

#### CP-CFG-01 — Visualizar información de la cuenta

| Campo | Detalle |
|-------|---------|
| **Módulo** | Configuración |
| **Tipo** | Funcional |
| **Severidad** | Media |
| **Precondiciones** | Usuario autenticado. |
| **Datos de prueba** | N/A |
| **Pasos** | 1. Navegar a `/settings` (o desde el menú del avatar → Perfil). |
| **Resultado esperado** | Se muestra el email del usuario autenticado y la fecha de creación de la cuenta en formato legible en español (ej. "15 de marzo, 2026"). Ambos campos son de solo lectura. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-CFG-02 — Cambio de contraseña exitoso

| Campo | Detalle |
|-------|---------|
| **Módulo** | Configuración |
| **Tipo** | Funcional / Seguridad |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario autenticado en `/settings`. |
| **Datos de prueba** | Actual: `Test1234!`, Nueva: `NuevaPass123!`, Confirmar: `NuevaPass123!` |
| **Pasos** | 1. Llenar contraseña actual. 2. Ingresar nueva contraseña (mínimo 8 caracteres). 3. Confirmar nueva contraseña. 4. Click en "Actualizar Contraseña". |
| **Resultado esperado** | Toast "¡Contraseña actualizada!". El formulario se limpia. Al cerrar sesión y volver a entrar, debe funcionar la nueva contraseña y fallar la antigua. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

#### CP-CFG-03 — Cambio de contraseña con contraseña actual incorrecta

| Campo | Detalle |
|-------|---------|
| **Módulo** | Configuración |
| **Tipo** | Validación / Seguridad |
| **Severidad** | Crítica |
| **Precondiciones** | Usuario autenticado en `/settings`. |
| **Datos de prueba** | Actual: `WrongPass`, Nueva: `NuevaPass123!`, Confirmar: `NuevaPass123!` |
| **Pasos** | 1. Ingresar una contraseña actual incorrecta. 2. Llenar el resto correctamente. 3. Click en "Actualizar Contraseña". |
| **Resultado esperado** | Mensaje de error "La contraseña actual es incorrecta" debajo del campo. La contraseña no cambia. |
| **Resultado obtenido** | _A completar_ |
| **Estado** | Pendiente |

---

## 11. Plantilla de reporte de defectos

Cuando un caso de prueba falle, registrar el defecto con la siguiente plantilla:

```
ID del defecto: BUG-XXX
Caso de prueba relacionado: CP-XXX-XX
Título: [Descripción corta del problema]
Severidad: Crítica / Alta / Media / Baja
Prioridad: Alta / Media / Baja
Ambiente: [Navegador, OS, resolución]
Fecha de detección: YYYY-MM-DD
Reportado por: [Nombre]

Pasos para reproducir:
1. ...
2. ...
3. ...

Resultado esperado:
[Lo que debería pasar]

Resultado actual:
[Lo que efectivamente pasó]

Evidencia:
[Captura de pantalla o video]

Estado: Abierto / En revisión / Resuelto / Cerrado / No es defecto
```

---

## 12. Anexo: Matriz de trazabilidad

| Requisito | Casos de prueba que lo cubren |
|-----------|-------------------------------|
| RF-01: Sistema de registro de usuarios | CP-AUTH-01, CP-AUTH-02, CP-AUTH-03, CP-AUTH-04 |
| RF-02: Sistema de inicio de sesión | CP-AUTH-05, CP-AUTH-06 |
| RF-03: Cierre de sesión | CP-AUTH-07 |
| RF-04: Protección de rutas | CP-AUTH-08, CP-AUTH-09 |
| RF-05: Crear/editar/eliminar eventos | CP-EVT-01 a CP-EVT-07 |
| RF-06: Crear/editar/eliminar tareas | CP-TSK-01 a CP-TSK-06 |
| RF-07: Visualización del calendario mensual | CP-CAL-01, CP-CAL-02, CP-CAL-03 |
| RF-08: Búsqueda y filtros de tareas | CP-TSK-03, CP-TSK-04 |
| RF-09: Extracción de eventos con IA | CP-IA-01 a CP-IA-05 |
| RF-10: Configuración de cuenta | CP-CFG-01, CP-CFG-02, CP-CFG-03 |

---

## Resumen ejecutivo

| Módulo | # de casos | Críticos | Altos | Medios | Bajos |
|--------|------------|----------|-------|--------|-------|
| Autenticación | 9 | 5 | 3 | 1 | 0 |
| Eventos | 7 | 1 | 5 | 1 | 0 |
| Tareas | 6 | 1 | 3 | 2 | 0 |
| Calendario | 3 | 0 | 1 | 1 | 1 |
| IA | 5 | 2 | 2 | 1 | 0 |
| Configuración | 3 | 2 | 0 | 1 | 0 |
| **TOTAL** | **30** | **11** | **14** | **7** | **1** |

---

**Fin del documento.**