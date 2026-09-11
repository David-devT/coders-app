<div align="center">

# ⚡ coders-app

### Plataforma Fullstack de Gestión y Coordinación de Equipos Técnicos

**Organiza y gestiona desarrolladores en Clans, coordinados por Team Leaders y estructurados en tableros Kanban.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📌 Descripción

**coders-app** es una plataforma web fullstack modular diseñada para la administración, asignación y monitoreo de equipos de desarrollo de software. Permite organizar desarrolladores en **Clans** (unidades técnicas de trabajo), cada uno supervisado por un **Team Leader**, bajo un esquema de control de acceso jerárquico (**RBAC**).

La plataforma opera bajo una arquitectura **Monorepo** desacoplada entre backend (API REST con Express 5, persistencia local atómica y sincronización opcional en la nube con Supabase) y frontend (Single Page Application con React 19, TypeScript y Vite), estilizada bajo el sistema de diseño de alto contraste *Urban Slate Precision* y asegurada mediante tokens **JWT**, **Helmet**, **Rate Limiting** y **Middleware de Validación de Esquemas**.

---

## 🚀 Características Principales

- 🛡️ **Control de Acceso Basado en Roles (RBAC)**: Tres niveles jerárquicos estrictos (*Coder*, *Team Leader* y *Admin*).
- 📂 **Gestión Integral de Clans y Coders**: Asignación y desvinculación automática en cascada con regla de negocio de hasta 2 Clans por Team Leader.
- 🔄 **Promoción y Degradación Dinámica**: Ascenso de Coders a Team Leaders y degradación de Team Leaders a Coders preservando credenciales y tareas asignadas.
- 📋 **Tablero Kanban con Transición Estricta de Estados**: Flujo de trabajo regulado (`Pending` → `Review` → `Approved` / `Rejected` → `Pending`).
- 📜 **Historial de Auditoría y Trazabilidad (Audit Trail)**: Registro cronológico inmutable de cada cambio de estado, autor, fecha/hora y notas de revisión de cada tarea.
- 🔔 **Sistema de Notificaciones Internas en Tiempo Real**: Notificaciones automáticas de eventos Kanban con campana interactiva, filtros ("Todas" / "No leídas") y borrado unitario o masivo.
- 🐙 **Integración con GitHub**: Enlace a commits y Pull Requests en las tareas con acceso directo desde el tablero y modal de detalle.
- 📊 **Exportación de Datos a CSV**: Generación y descarga instantánea de reportes en formato CSV para el tablero Kanban y directorio de Clanes.
- 🗑️ **Papelera y Restauración (Soft Delete)**: Eliminación lógica y panel de recuperación de tareas exclusivo para administradores.
- 🎨 **Diseño Moderno Urban Slate (100% SVG)**: Interfaz refinada en tonos carbón, grafito, arena bronce (`#AB978C`) y azul acero (`#6B7C98`), con menús desplegables interactivos, menú de perfil de usuario y cero emojis (iconografía vectorial SVG nativa).
- ☁️ **Persistencia Híbrida**: Almacenamiento local JSON atómico con sincronización bidireccional automática en la nube mediante Supabase.
- 🔒 **Seguridad y Validación Reforzada**: Contraseñas cifradas con `bcrypt` (10 rondas), cabeceras HTTP seguras con Helmet, limitador de tasa contra fuerza bruta y middleware de sanitización de datos de entrada.
- 🧪 **Suite Automatizada de Pruebas**: 46 pruebas unitarias y de integración del backend con cobertura del 100%.

---

## 📱 Guía Detallada de Funcionalidades de la Aplicación

A continuación se detalla cada una de las funcionalidades que componen la plataforma:

### 1. 🔐 Autenticación y Control de Acceso Jerárquico (RBAC)
- **Registro de Usuarios:** Los nuevos desarrolladores pueden crear su cuenta directamente en el formulario público con rol inicial de *Coder*.
- **Inicio de Sesión Seguro:** Autenticación con verificación de contraseña cifrada con `bcrypt` y generación de token de sesión JWT con validez de 24 horas.
- **Protección de Red:** Endpoints de autenticación protegidos con limitador de tasa (*Rate Limiting*) para mitigar ataques de fuerza bruta o escaneos automáticos.
- **Vistas Adaptativas:** El menú de navegación y las acciones disponibles en pantalla se adaptan dinámicamente según el rol del usuario autenticado:
  - **Coder:** Consulta su clan, visualiza tareas asignadas y envía entregables a revisión.
  - **Team Leader:** Gestiona coders de sus clanes, crea tareas, aprueba o rechaza entregables y supervisa su pipeline técnico.
  - **Admin:** Control total de la plataforma, gestión global de clanes y líderes, ascenso/degradación de usuarios y restauración de tareas eliminadas.

### 2. 👥 Directorio y Gestión de Coders
- **Búsqueda Predictiva:** Campo de búsqueda en tiempo real que filtra instantáneamente por nombre, correo electrónico o nombre de clan.
- **Filtro por Clan Asignado:** Menú selector estilizado para aislar coders pertenecientes a una unidad específica o sin asignar.
- **Operaciones CRUD:** Creación de nuevos coders con contraseña inicial, edición de perfiles y reasignación de clanes.
- **Desvinculación en Cascada:** Al eliminar o reasignar un coder, el sistema mantiene la integridad referencial actualizando las listas de miembros de clanes y desasociando tareas pendientes.
- **Paginación Dinámica:** Navegación por páginas para mantener un rendimiento óptimo independientemente del volumen de desarrolladores.

### 3. 🛡️ Gestión de Clanes y Regla de Negocio de 2 Clanes
- **Unidades Técnicas:** Organización de proyectos y coders en Clanes estructurados con nombre y descripción técnica.
- **Regla Estricta de 2 Clanes por Team Leader:** El sistema valida tanto en el frontend como en el backend que ningún Team Leader pueda estar a cargo de más de 2 clanes en simultáneo. Si se intenta asignar un tercer clan, la petición es rechazada con un mensaje de validación claro.
- **Métricas de Clan en Tiempo Real:** Cada tarjeta de clan informa la cantidad de coders miembros y el número de tareas actualmente activas en el pipeline.
- **Exportación CSV de Clanes:** Botón de un solo clic que descarga un archivo `.csv` compatible con Excel con el reporte completo del directorio de clanes.

### 4. 🎖️ Directorio de Team Leaders (Promoción y Degradación)
- **Supervisión de Líderes:** Directorio exclusivo para administradores que consolida la lista de líderes técnicos y los clanes bajo su responsabilidad.
- **Promoción Dinámica de Coder:** Permite seleccionar cualquier Coder existente y ascenderlo a *Team Leader* de manera inmediata, otorgándole permisos de liderazgo sin requerir crear una cuenta nueva ni perder su historial previo.
- **Degradación a Coder:** Permite degradar a un Team Leader a rol de *Coder*, liberando automáticamente la asignación de sus clanes liderados para que puedan ser reasignados.

### 5. 📋 Tablero Kanban Interactivo de Tareas
- **Flujo de Trabajo Regulado:**
  1. `Pending`: Tarea registrada, pendiente de desarrollo o implementación.
  2. `In Review`: Tarea completada por el coder, enviada formalmente a revisión técnica.
  3. `Approved`: Tarea aprobada por el Team Leader o Administrador (estado terminal de éxito).
  4. `Rejected`: Tarea devuelta con feedback correctivo para que el coder realice los ajustes necesarios antes de volver a enviarla.
- **Arrastrar y Soltar (Drag & Drop):** Capacidad nativa de arrastrar tarjetas entre columnas, validando en tiempo real si el usuario tiene permisos para la transición solicitada:
  - Solo el Coder asignado o un Administrador pueden enviar una tarea de *Pending* a *In Review*.
  - Solo el Team Leader del clan o un Administrador pueden *Aprobar* o *Rechazar* tareas en revisión.
  - Solo el Team Leader o un Administrador pueden *Reabrir* tareas rechazadas.
- **Filtros Combinados:** Filtrado multidimensional simultáneo por texto (búsqueda en título, descripción y responsable), por Clan y por nivel de Prioridad (*Alta*, *Media*, *Baja*), con botón de restablecimiento rápido.
- **Indicadores KPI en Tiempo Real:** Tarjetas métricas superiores que muestran el total de coders, tareas totales, tareas en pipeline y el porcentaje de tasa de aprobación global.
- **Exportación CSV del Tablero:** Descarga un informe `.csv` con todas las tareas que coincidan con los filtros aplicados en pantalla.
- **Papelera de Reciclaje (Soft Delete):** Los administradores pueden enviar tareas a la papelera sin destruirlas físicamente, consultarlas en una bandeja de eliminadas y restaurarlas al tablero en cualquier momento.

### 6. 📜 Trazabilidad e Historial de Auditoría (Audit Trail)
- **Registro Inmutable:** Cada tarea registra internamente un historial de eventos cronológicos que almacena:
  - Estado anterior y nuevo estado alcanzado.
  - Usuario que ejecutó la transición (ID, nombre completo y rol).
  - Fecha y hora exacta de la modificación.
  - Notas de feedback técnico o motivos de rechazo introducidos durante la revisión.
- **Línea de Tiempo Visual:** Accesible desde el modal de detalle de la tarea, permitiendo a los líderes auditar la evolución completa del trabajo.

### 7. 🔔 Sistema de Notificaciones Internas en Tiempo Real
- **Generación Automática de Eventos:**
  - Cuando un Coder envía una tarea a `Review`, se notifica automáticamente al Team Leader de su clan y a los Administradores.
  - Cuando un Team Leader o Admin aprueba o rechaza una tarea, se envía una notificación directa al Coder asignado con el resultado y las notas de feedback adjuntas.
- **Campana de Notificaciones en Cabecera:** Muestra un badge numérico con las notificaciones no leídas y cuenta con un menú desplegable de alta visibilidad.
- **Pestañas de Filtrado:** Alternador dentro del menú para visualizar *"Todas"* las notificaciones o únicamente las *"No leídas"*.
- **Gestión de Lectura y Borrado:**
  - Botón *"Marcar todas leídas"*.
  - Clic en tarjeta individual para marcarla como leída.
  - Botón de papelera en cada notificación para eliminarla individualmente.
  - Botón *"Borrar todas"* para limpiar todo el historial de avisos de una sola vez.

### 8. 🐙 Enlaces a Commits y Pull Requests de GitHub
- **Vinculación Directa:** Al crear o editar una tarea, se puede registrar la URL de un Pull Request o commit de GitHub (e.g. `https://github.com/usuario/repo/pull/123`).
- **Badge y Acceso Rápido:** Las tarjetas en el tablero exhiben una insignia `PR` que indica la presencia del enlace, y el modal de detalle ofrece un botón directo *"Abrir en GitHub"* para revisión inmediata de código.

### 9. 🎨 Menús Desplegables Estilizados y Cero Emojis (100% SVG)
- **Menú Lateral de Navegación (`Sidebar`):** Enlaces con barra indicadora activa en tono bronce (`#AB978C`), micro-interacciones hover en iconos y diseño de alta legibilidad.
- **Menú de Perfil de Usuario (`User Menu`):** Desplegable flotante en la esquina superior derecha que resume el perfil del usuario conectado, correo, rol actual, accesos rápidos y botón de cierre de sesión.
- **Selects Vectoriales:** Todos los desplegables y filtros nativos cuentan con una flecha vectorial SVG en bronce cálido (`#AB978C`) y estilos de alto contraste.
- **100% Iconografía SVG:** Toda la interfaz utiliza componentes vectoriales de Lucide React, eliminando emojis de texto para una apariencia profesional y uniforme en cualquier pantalla.

---


## 🏗️ Arquitectura del Sistema

```
coders-app/
├── backend/                        # API REST - Node.js + Express 5
│   └── src/
│       ├── config/                 # Conector Supabase e inicializador de base de datos
│       ├── controllers/            # Controladores HTTP (request / response)
│       ├── data/                   # Persistencia local JSON (ignorado en Git)
│       ├── middleware/             # Middlewares de autenticación JWT y RBAC
│       ├── models/                 # Modelos de datos y operaciones CRUD
│       ├── routes/                 # Rutas de endpoints de la API
│       ├── scripts/                # Seeds de prueba y suite automatizada de testing
│       ├── services/               # Lógica de negocio y enriquecimiento relacional
│       ├── index.js                # Inicialización del servidor HTTP
│       └── server.js               # Middlewares, CORS, Helmet, Rate Limiter y rutas
│
├── frontend/                       # SPA - React 19 + TypeScript + Vite 8
│   ├── public/                     # Favicons vectoriales de alto contraste
│   └── src/
│       ├── api/                    # Cliente Axios centralizado e interceptores
│       ├── components/             # Componentes de UI (Clans, Coders, Tasks, Layout)
│       ├── hooks/                  # Hooks asíncronos con TanStack Query
│       ├── pages/                  # Vistas principales (LoginPage, DashboardPage)
│       ├── stores/                 # Gestión de estado global de sesión con Zustand
│       ├── types/                  # Definición de interfaces y tipos TypeScript
│       └── index.css               # Tokens de tema y diseño Urban Slate
│
└── package.json                    # Scripts del monorepo
```

---

## 💻 Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|:---|:---:|:---|
| **Node.js** | >= 18 | Entorno de ejecución en servidor |
| **Express** | 5.x | Framework HTTP para la API REST |
| **@supabase/supabase-js** | 2.x | Cliente para sincronización de datos en nube |
| **bcryptjs** | 3.x | Cifrado seguro de contraseñas (10 rondas de salt) |
| **jsonwebtoken** | 9.x | Emisión y verificación de tokens de sesión JWT (24h) |
| **helmet** | 8.x | Hardening de cabeceras HTTP de seguridad |
| **express-rate-limit** | 8.x | Mitigación de ataques de fuerza bruta en autenticación |
| **uuid** | 11.x | Generación de identificadores únicos UUID v4 |
| **cors** | 2.x | Control de acceso cruzado entre dominios |
| **dotenv** | 17.x | Carga de variables de entorno |

### Frontend
| Tecnología | Versión | Propósito |
|:---|:---:|:---|
| **React** | 19.x | Biblioteca para interfaces reactivas |
| **TypeScript** | 5.x | Tipado estático y robustez del código |
| **Vite** | 8.x | Empaquetador ultrarrápido y servidor de desarrollo HMR |
| **Tailwind CSS** | 4.x | Sistema de estilos atómicos y responsive |
| **Zustand** | 5.x | Store liviano para estado global de autenticación |
| **TanStack Query** | 5.x | Gestión de caché asíncrona y sincronización de datos |
| **Axios** | 1.x | Cliente HTTP con inyección automática de tokens |
| **React Router** | 7.x | Navegación del lado del cliente y rutas protegidas |
| **Lucide React** | 1.x | Iconografía vectorial técnica |
| **Sonner** | 2.x | Notificaciones toast interactivas |

---

## 📐 Modelo de Dominio

```
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│   TeamLeader    │   1:N    │      Clan       │   N:C    │      Coder      │
│─────────────────│──────────│─────────────────│──────────│─────────────────│
│ id (UUID v4)    │          │ id (UUID v4)    │          │ id (UUID v4)    │
│ name            │          │ name            │          │ name            │
│ email (único)   │          │ description     │          │ email (único)   │
│ password (*)    │          │ teamLeader ◄────┼──────────│ password (*)    │
│ role            │          │ coders[]  ──────┼─────────►│ clan ◄──────────│
│ timestamps      │          │ timestamps      │          │ timestamps      │
└─────────────────┘          └─────────────────┘          └─────────────────┘
         ▲                                                         ▲
         │                                                         │
         │                  ┌─────────────────┐                    │
         │                  │      Task       │                    │
         │                  │─────────────────│                    │
         └──────────────────┼ clanId          │                    │
                            │ assigneeId ─────┼────────────────────┘
                            │ status          │ (Pending | Review | Approved | Rejected)
                            │ history[]       │ (Audit trail inmutable)
                            │ githubUrl       │ (Enlace opcional a commit/PR)
                            │ timestamps      │
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  Notification   │
                            │─────────────────│
                            │ id (UUID v4)    │
                            │ userId          │
                            │ title           │
                            │ message         │
                            │ type            │ (info | success | warning | alert)
                            │ read (boolean)  │
                            │ createdAt       │
                            └─────────────────┘

(*) Contraseñas cifradas con bcrypt - excluidas de todas las respuestas públicas
```

---

## 🔐 Matriz de Permisos (RBAC)

| Operación / Recurso | Coder | Team Leader | Admin |
|:---|:---:|:---:|:---:|
| Ver perfil propio (`/api/auth/me`) | ✅ | ✅ | ✅ |
| Listar Coders y Clans | ✅ | ✅ | ✅ |
| Crear / Editar / Eliminar Coders | ❌ | ✅ | ✅ |
| Crear / Editar / Eliminar Clans | ❌ | ✅ | ✅ |
| Listar Team Leaders | ❌ | ✅ | ✅ |
| Crear / Editar / Eliminar Team Leaders | ❌ | ❌ | ✅ |
| Promover Coder a Team Leader / Degradar TL | ❌ | ❌ | ✅ |
| Crear Tareas (Tasks) | ❌ | ✅ | ✅ |
| Mover tarea a Review (`Pending` → `Review`) | ✅ *(solo asignado)* | ✅ | ✅ |
| Aprobar / Rechazar tareas (`Review` → `Approved`/`Rejected`) | ❌ | ✅ *(de sus clans)* | ✅ |
| Reabrir tareas rechazadas (`Rejected` → `Pending`) | ❌ | ✅ | ✅ |
| Soft Delete y Restaurar Tareas Eliminadas | ❌ | ❌ | ✅ |
| Consultar y gestionar sus propias Notificaciones | ✅ | ✅ | ✅ |


---

## 📑 Referencia de la API REST

### Autenticación
| Método | Endpoint | Descripción | Acceso |
|:---:|:---|:---|:---:|
| `POST` | `/api/auth/register` | Registro de nuevo Coder | Público |
| `POST` | `/api/auth/login` | Autenticación y generación de JWT | Público (Rate Limited) |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado | Bearer Token |

### Coders
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/coders` | Listar todos los coders con clanes vinculados | Autenticado |
| `GET` | `/api/coders/:id` | Obtener información de coder por ID | Autenticado |
| `POST` | `/api/coders` | Registrar nuevo coder | `teamLeader`, `admin` |
| `PUT` | `/api/coders/:id` | Actualizar datos o clan de un coder | `teamLeader`, `admin` |
| `DELETE` | `/api/coders/:id` | Eliminar coder y desvincular tareas/clanes | `teamLeader`, `admin` |

### Clans
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/clans` | Listar todos los clans con líderes y miembros | Autenticado |
| `GET` | `/api/clans/:id` | Obtener información detallada de clan por ID | Autenticado |
| `POST` | `/api/clans` | Crear nuevo clan (máximo 2 por Team Leader) | `teamLeader`, `admin` |
| `PUT` | `/api/clans/:id` | Actualizar nombre, descripción o líder del clan | `teamLeader`, `admin` |
| `DELETE` | `/api/clans/:id` | Eliminar clan y desasociar coders asignados | `teamLeader`, `admin` |

### Team Leaders
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/team-leaders` | Listar líderes de equipo con clanes a cargo | `teamLeader`, `admin` |
| `GET` | `/api/team-leaders/:id` | Obtener líder de equipo por ID | `admin` |
| `POST` | `/api/team-leaders` | Crear nuevo líder de equipo | `admin` |
| `POST` | `/api/team-leaders/promote` | Promover un Coder a Team Leader | `admin` |
| `POST` | `/api/team-leaders/demote` | Degradar un Team Leader a Coder | `admin` |
| `PUT` | `/api/team-leaders/:id` | Actualizar datos de líder de equipo | `admin` |
| `DELETE` | `/api/team-leaders/:id` | Eliminar líder de equipo | `admin` |

### Tareas (Tasks)
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/tasks` | Listar tareas activas (filtradas por rol y clan) | Autenticado |
| `GET` | `/api/tasks/deleted` | Listar tareas en papelera de reciclaje | `admin` |
| `GET` | `/api/tasks/:id` | Obtener información de tarea con su historial de auditoría | Autenticado |
| `POST` | `/api/tasks` | Crear nueva tarea con validación y githubUrl opcional | `teamLeader`, `admin` |
| `PATCH` | `/api/tasks/:id/status` | Actualizar estado Kanban validando reglas RBAC y feedback | Autenticado |
| `PUT` | `/api/tasks/:id` | Actualizar título, descripción o prioridad | `teamLeader`, `admin` |
| `POST` | `/api/tasks/:id/restore` | Restaurar tarea desde la papelera de reciclaje | `admin` |
| `DELETE` | `/api/tasks/:id` | Enviar tarea a la papelera (Soft Delete) | `admin` |

### Notificaciones Internas
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/notifications` | Listar notificaciones y conteo de no leídas del usuario | Autenticado |
| `PATCH` | `/api/notifications/read-all` | Marcar todas las notificaciones pendientes como leídas | Autenticado |
| `PATCH` | `/api/notifications/:id/read` | Marcar una notificación individual como leída | Autenticado |
| `DELETE` | `/api/notifications/clear-all` | Eliminar todo el historial de notificaciones del usuario | Autenticado |
| `DELETE` | `/api/notifications/:id` | Eliminar una notificación específica por ID | Autenticado |

---

## 🔄 Flujo de Estados del Tablero Kanban

```
┌─────────────┐       Assignee / Admin        ┌──────────────┐
│   PENDING   │ ────────────────────────────► │  IN REVIEW   │
└─────────────┘       "Mark for Review"       └──────────────┘
       ▲                                             │
       │                                     Approve │ Reject
       │                                             │
Reopen │ (Admin / TL)                                ▼
       │                                      ┌──────────────┐
       ├───────────────────────────────────── │   REJECTED   │
       │                                      └──────────────┘
       │                                             
       │                                      ┌──────────────┐
       └───────────────────────────────────── │   APPROVED   │ (Estado terminal)
                                              └──────────────┘
```

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** >= 18.x
- **npm** (incluido con Node.js)

### 1. Instalar dependencias del Monorepo
Ejecutar desde la raíz del proyecto para instalar dependencias simultáneamente en raíz, backend y frontend:
```bash
npm run install:all
```

### 2. Configuración de Variables de Entorno
Crear el archivo `backend/.env` con los parámetros del servicio:

```env
APP_PORT=3000
JWT_SECRET=tu_clave_secreta_jwt_aqui

# Configuración opcional de Supabase:
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_supabase_anon_o_service_key
```

### 3. Inicializar Cuentas y Datos de Demostración
Poblar la base de datos con clanes, coders, líderes y tareas de muestra:
```bash
npm run seed
```

### 4. Ejecutar la Aplicación en Desarrollo
Iniciar el servidor Express y el cliente Vite concurrentemente:
```bash
npm run dev
```

| Servicio | URL Local | Descripción |
|:---|:---|:---|
| **Frontend SPA** | `http://localhost:5173` | Interfaz de usuario reactiva con Vite HMR |
| **Backend API** | `http://localhost:3000` | Servidor de endpoints REST con hot-reload |

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|:---|:---|
| `npm run dev` | Ejecuta backend y frontend en paralelo con hot-reload |
| `npm run dev:backend` | Ejecuta únicamente el servidor backend |
| `npm run dev:frontend` | Ejecuta únicamente el cliente frontend |
| `npm run seed` | Carga o restablece los datos iniciales de prueba |
| `npm --prefix backend run test` | Ejecuta la suite completa de 46 pruebas automatizadas del backend |
| `npm --prefix frontend run build` | Compila y optimiza el frontend para producción con TypeScript |

---

## 🔒 Consideraciones de Seguridad y Buenas Prácticas

- **Almacenamiento Protegido**: Los datos locales residen en `backend/src/data/`, directorio protegido e ignorado por Git.
- **Credenciales Seguras**: Contraseñas cifradas con `bcrypt` (10 rondas de salt) y excluidas de las respuestas JSON.
- **Validación Multicapa**: Middleware de validación de esquemas (`validation.middleware.js`) y control estricto de transiciones de estado Kanban en servicios.
- **Trazabilidad y Auditoría**: Tareas auditadas con historial inmutable de cambios y notas de revisión.
- **Protección de Red**: Limitador de tasa contra ataques de fuerza bruta (`rateLimit.middleware.js`) y cabeceras HTTP endurecidas con Helmet.


---

<div align="center">
Desarrollado con arquitectura fullstack modular y buenas prácticas de ingeniería de software.
</div>
