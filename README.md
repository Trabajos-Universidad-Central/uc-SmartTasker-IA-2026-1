# SmartTasker: Tu asistente inteligente para gestionar el tiempo

SmartTasker es una aplicación web moderna diseñada para ayudar a usuarios de todo tipo a organizar mejor su tiempo y administrar eventos, tareas y recordatorios de forma más eficiente. Ofrece un dashboard y panel de control dinámico para visualizar rápidamente tus eventos más importantes, gestión de eventos intuitiva, capacidades de IA multimodal para extraer texto de imágenes, y un **sistema de autenticación que protege la información de cada usuario**.

## Características Principales

- **Autenticación de usuarios**: Sistema de **login y registro** con Supabase Auth. Cada usuario accede únicamente a su propio espacio tras iniciar sesión.
- **Rutas protegidas**: Las páginas del dashboard, calendario, tareas y configuración están protegidas — solo son accesibles para usuarios autenticados. Cualquier intento de acceso sin sesión redirige automáticamente a la página de login.
- **Panel de Control Dinámico**: Visualiza el estado actual, tareas pendientes y eventos futuros de un vistazo.
- **Gestión de Eventos y Tareas**: Crea, edita, elimina y organiza eventos, tareas y recordatorios en un calendario y una lista de tareas dedicada.
- **Extracción de Texto de Imágenes con IA**: Procesa imágenes para generar automáticamente datos estructurados, facilitando la creación de eventos y tareas sin entrada manual.
- **Filtrado y Búsqueda**: Encuentra tareas rápidamente con filtros por prioridad y búsqueda por texto.
- **Interfaz Moderna y Responsiva**: Un diseño limpio, construido con las últimas tecnologías, que se adapta a cualquier dispositivo.

---

## Arquitectura del Proyecto

El proyecto está construido sobre una arquitectura moderna basada en componentes, aprovechando las mejores prácticas del ecosistema de React y Next.js.

- **Frontend**: Construido con **Next.js 15** y el **App Router**, lo que permite renderizado en el servidor (SSR) y una excelente optimización.
- **Lenguaje**: **TypeScript** para un código más robusto y mantenible.
- **UI y Estilos**:
  - **Tailwind CSS** para un sistema de diseño basado en utilidades.
  - **ShadCN/UI** como librería de componentes, que proporciona elementos de UI accesibles y personalizables.
  - **Lucide React** para los iconos.
- **Gestión de Estado**: Se utiliza la **API de Contexto de React** (`useContext`) para gestionar el estado global de los eventos y tareas.
- **Formularios**: **React Hook Form** para la gestión de formularios y **Zod** para la validación de esquemas.
- **Autenticación**: **Supabase Auth** (`@supabase/supabase-js` + `@supabase/ssr`) para gestionar usuarios, sesiones y cookies de forma segura. La protección de rutas se implementa mediante **Next.js Middleware** que corre en el Edge runtime.
- **Inteligencia Artificial**: **Genkit** con el plugin de **Google AI (Gemini)** para potenciar las funcionalidades de IA.

La estructura de carpetas sigue las convenciones de Next.js:

- `src/app/`: Contiene las rutas de la aplicación.
  - `src/app/login/`: Página de autenticación con login y registro.
- `src/components/`: Componentes reutilizables, organizados por funcionalidad (dashboard, layout, ui).
- `src/context/`: Contiene los proveedores de contexto para el estado global.
- `src/hooks/`: Hooks reutilizables. Incluye `use-auth.ts` que expone el usuario autenticado al resto de la aplicación.
- `src/lib/`: Utilidades, tipos de datos, y datos estáticos.
  - `src/lib/supabase/`: Helpers para los clientes de Supabase en navegador y en el middleware.
- `src/ai/`: Lógica relacionada con Genkit y los flujos de IA.
- `src/middleware.ts`: Middleware de Next.js que protege las rutas y redirige al login cuando no hay sesión activa.

---

## Autenticación y Rutas Protegidas

SmartTasker utiliza **Supabase Auth** como backend de autenticación. Esto permite que cada usuario tenga su propia cuenta y que toda la aplicación quede resguardada detrás del login.

### Flujo de autenticación

1. Al entrar a cualquier ruta sin una sesión activa, el middleware redirige automáticamente a `/login`.
2. En `/login` el usuario encuentra una interfaz con dos pestañas:
   - **Iniciar sesión**: formulario con correo y contraseña.
   - **Crear cuenta**: formulario con nombre completo, correo, contraseña y confirmación de contraseña.
3. Al iniciar sesión o registrarse correctamente, el usuario es redirigido al panel de control (`/`).
4. Una vez autenticado, el usuario puede cerrar sesión desde el menú del avatar en la esquina superior derecha.

### Rutas públicas vs. protegidas

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/login` | Pública | Página de inicio de sesión y registro |
| `/` | Protegida | Panel de control principal |
| `/calendar` | Protegida | Vista de calendario |
| `/tasks` | Protegida | Lista de tareas |
| `/settings` | Protegida | Configuración y datos de la cuenta |
| `/api/extract-event` | Protegida | Endpoint de IA para extraer eventos de imágenes |

Si un usuario ya autenticado intenta acceder a `/login`, el middleware lo redirige automáticamente al panel de control.

### Datos del usuario en la interfaz

- **Header**: muestra el nombre o correo del usuario autenticado y el botón "Cerrar Sesión".
- **Página de Configuración (`/settings`)**: muestra el correo real del usuario y la fecha de creación de su cuenta en formato legible en español.

---

## Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu entorno local, sigue estos pasos:

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- `npm` o un gestor de paquetes compatible
- Credenciales del proyecto de Supabase compartidas por el administrador del equipo
- Una API key de [Google AI Studio](https://aistudio.google.com/) para la funcionalidad de extracción de eventos con IA

### 1. Clonar el Repositorio

```bash
git clone https://github.com/your-username/smart-tasker.git
cd smart-tasker
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

```bash
npm install
```

### 3. Obtener las Credenciales de Supabase

El proyecto en Supabase **ya está creado y configurado** para el equipo. Todos los integrantes se conectan al mismo backend de autenticación, por lo que no es necesario crear un proyecto nuevo.

Para conectarte solo necesitas dos valores:

- `NEXT_PUBLIC_SUPABASE_URL`: la URL del proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: la **Publishable key** del proyecto (empieza con `sb_publishable_...`).

Solicita estas credenciales al administrador del proyecto por un canal privado (mensaje directo, gestor de secretos, etc.). **Nunca las compartas en canales públicos** ni las subas al repositorio.

> **Configuración del proyecto (solo como referencia)**
> El proyecto de Supabase ya tiene habilitado el proveedor **Email** y tiene deshabilitada la opción **"Confirm email"**, lo que permite que el registro inicie sesión de inmediato sin verificación por correo. Esta configuración se puede consultar o modificar desde el dashboard en **Authentication → Sign In / Up**.

> **Nota sobre las keys**: La **Publishable key** es la versión pública de la antigua `anon key` y es segura de usar en el cliente. **Nunca uses la Secret key** (`sb_secret_...`) en este proyecto — esa tiene permisos administrativos y no debe ser expuesta al navegador.

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (al mismo nivel que `package.json`) con el siguiente contenido:

```env
# .env.local

# Gemini (IA para extraer eventos de imágenes)
GEMINI_API_KEY=TU_API_KEY_DE_GEMINI

# Supabase (autenticación)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tu_key
```

> **Importante**:
> - No pongas espacios alrededor del signo `=`. Por ejemplo, `NEXT_PUBLIC_SUPABASE_URL=https://...` es correcto; `NEXT_PUBLIC_SUPABASE_URL = https://...` puede generar valores con espacios al inicio y romper la conexión.
> - Las variables con prefijo `NEXT_PUBLIC_` son enviadas al navegador por diseño (Next.js las expone intencionalmente). En el caso de la Publishable key de Supabase, esto es seguro.
> - El archivo `.env.local` está incluido en `.gitignore`, por lo que no se subirá al repositorio.

Puedes usar `.env.local.example` como plantilla inicial.

### 5. Ejecutar el Servidor de Desarrollo

Ahora puedes iniciar la aplicación en modo de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`.

Al entrar por primera vez serás redirigido automáticamente a `/login`. Crea una cuenta desde la pestaña **Crear cuenta** y el sistema te llevará al panel de control.

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción después de compilar.
- `npm run lint`: Ejecuta el linter para revisar el código.
- `npm run typecheck`: Verifica los tipos de TypeScript sin emitir archivos.
