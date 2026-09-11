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

La plataforma opera bajo una arquitectura **Monorepo** desacoplada entre backend (API REST con Express 5 y sincronización opcional con Supabase) y frontend (Single Page Application con React 19, TypeScript y Vite), estilizada bajo el sistema de diseño de alto contraste *Urban Slate Precision* y asegurada mediante tokens **JWT**, **Helmet** y limitadores de tasa (**Rate Limiting**).

---

## 🚀 Características Principales

- 🛡️ **Control de Acceso Basado en Roles (RBAC)**: Tres niveles jerárquicos estrictos (*Coder*, *Team Leader* y *Admin*).
- 📂 **Gestión Integral de Clans y Coders**: Asignación y desvinculación automática en cascada con regla de negocio de hasta 2 Clans por Team Leader.
- 🔄 **Promoción y Degradación Dinámica**: Ascenso de Coders a Team Leaders y degradación de Team Leaders a Coders preservando credenciales y tareas asignadas.
- 📋 **Tablero Kanban con Transición Estricta de Estados**: Flujo de trabajo regulado (`Pending` → `Review` → `Approved` / `Rejected` → `Pending`).
- 🗑️ **Papelera y Restauración (Soft Delete)**: Eliminación lógica y panel de recuperación de tareas exclusivo para administradores.
- 🎨 **Diseño Moderno Urban Slate**: Interfaz elegante en tonos carbón, grafito, arena bronce (`#AB978C`) y azul acero (`#6B7C98`) con soporte para Drag & Drop y métricas KPI en tiempo real.
- ☁️ **Persistencia Híbrida**: Almacenamiento local JSON atómico con sincronización bidireccional automática en la nube mediante Supabase.
- 🔒 **Seguridad Reforzada**: Contraseñas cifradas con `bcrypt` (10 rondas), cabeceras de seguridad HTTP con Helmet y protección contra ataques de fuerza bruta en login.

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
| `GET` | `/api/tasks/:id` | Obtener información de tarea por ID | Autenticado |
| `POST` | `/api/tasks` | Crear nueva tarea con estado inicial Pending | `teamLeader`, `admin` |
| `PATCH` | `/api/tasks/:id/status` | Actualizar estado Kanban validando reglas RBAC | Autenticado |
| `PUT` | `/api/tasks/:id` | Actualizar título, descripción o prioridad | `teamLeader`, `admin` |
| `POST` | `/api/tasks/:id/restore` | Restaurar tarea desde la papelera de reciclaje | `admin` |
| `DELETE` | `/api/tasks/:id` | Enviar tarea a la papelera (Soft Delete) | `admin` |

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
| `npm --prefix backend run test` | Ejecuta la suite completa de 33 pruebas del backend |
| `npm --prefix frontend run build` | Compila y optimiza el frontend para producción |

---

## 🔒 Consideraciones de Seguridad y Buenas Prácticas

- **Almacenamiento Protegido**: Los datos locales residen en `backend/src/data/`, directorio protegido e ignorado por Git.
- **Credenciales Seguras**: Cuentas iniciales gestionadas fuera del código fuente y protegidas contra exposición en respuestas HTTP.
- **Cifrado Robusto**: Uso de `bcrypt` con 10 rondas de salt para proteger contraseñas.
- **Validación Multicapa**: Control estricto de transiciones de estado Kanban y límite de 2 clanes por Team Leader verificado en la capa de servicios.
- **Protección de Red**: Limitador de tasa en peticiones de autenticación y cabeceras endurecidas con Helmet.

---

<div align="center">
Desarrollado con arquitectura fullstack modular y buenas prácticas de ingeniería de software.
</div>
