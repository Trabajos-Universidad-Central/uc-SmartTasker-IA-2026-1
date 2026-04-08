# SmartTasker: Tu Asistente Académico Inteligente

SmartTasker es una aplicación web moderna diseñada para ayudar a los estudiantes a organizar su vida académica de manera eficiente. Con un panel de control dinámico, gestión de eventos y tareas, y recomendaciones de estudio personalizadas mediante inteligencia artificial, SmartTasker se convierte en el compañero perfecto para el éxito académico.

![SmartTasker Screenshot](https://i.imgur.com/your-screenshot.png) <!-- Reemplaza con una captura de pantalla de tu app -->

## Características Principales

- **Panel de Control Dinámico**: Visualiza el estado académico, tareas pendientes y eventos futuros de un vistazo.
- **Gestión de Eventos y Tareas**: Crea, edita, elimina y organiza eventos, tareas y recordatorios en un calendario y una lista de tareas dedicada.
- **Filtrado y Búsqueda**: Encuentra tareas rápidamente con filtros por prioridad y búsqueda por texto.
- **Recomendaciones de IA**: Obtén sugerencias de estudio personalizadas gracias a la integración con modelos de IA generativa.
- **Interfaz Moderna y Responsiva**: Un diseño limpio, construido con las últimas tecnologías, que se adapta a cualquier dispositivo.

---

## Arquitectura del Proyecto

El proyecto está construido sobre una arquitectura moderna basada en componentes, aprovechando las mejores prácticas del ecosistema de React y Next.js.

- **Frontend**: Construido con **Next.js** y el **App Router**, lo que permite renderizado en el servidor (SSR) y una excelente optimización.
- **Lenguaje**: **TypeScript** para un código más robusto y mantenible.
- **UI y Estilos**:
  - **Tailwind CSS** para un sistema de diseño basado en utilidades.
  - **ShadCN/UI** como librería de componentes, que proporciona elementos de UI accesibles y personalizables.
  - **Lucide React** para los iconos.
- **Gestión de Estado**: Se utiliza la **API de Contexto de React** (`useContext`) para gestionar el estado global de los eventos y tareas de forma sencilla y eficiente.
- **Formularios**: **React Hook Form** para la gestión de formularios y **Zod** para la validación de esquemas.
- **Inteligencia Artificial**: **Genkit** con el plugin de **Google AI (Gemini)** para potenciar las funcionalidades de IA.

La estructura de carpetas sigue las convenciones de Next.js:

- `src/app/`: Contiene las rutas de la aplicación (Dashboard, Calendario, Tareas, Configuración).
- `src/components/`: Componentes reutilizables, organizados por funcionalidad (dashboard, layout, ui).
- `src/context/`: Contiene los proveedores de contexto para el estado global.
- `src/lib/`: Utilidades, tipos de datos, y datos estáticos.
- `src/ai/`: Lógica relacionada con Genkit y los flujos de IA.

---

## Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu entorno local, sigue estos pasos:

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- `npm` o un gestor de paquetes compatible

### 1. Clonar el Repositorio

```bash
# (Si estás trabajando fuera de Firebase Studio)
git clone https://github.com/your-username/smart-tasker.git
cd smart-tasker
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave de API para el modelo de Gemini. Puedes obtener una desde [Google AI Studio](https://aistudio.google.com/).

```env
# .env.local

GEMINI_API_KEY="TU_API_KEY_DE_GEMINI"
```

### 4. Ejecutar el Servidor de Desarrollo

Ahora puedes iniciar la aplicación en modo de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`.

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción después de compilar.
- `npm run lint`: Ejecuta el linter para revisar el código.

## Contribuciones



