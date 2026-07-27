<div align="center">

# ⚡ Coders App

### Plataforma de gestión de equipos de desarrollo

**Organiza tu fuerza técnica en Clans, liderados por Team Leaders y compuestos por Coders.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Descripción

**Coders App** es una aplicación web fullstack diseñada para la gestión de equipos de desarrollo de software. Permite organizar coders en **Clans** (unidades de trabajo), cada uno liderado por un **Team Leader**, con un sistema de roles jerárquicos que controla el acceso a las operaciones CRUD.

La aplicación sigue una arquitectura **monorepo** con separación clara entre backend (API REST) y frontend (SPA), comunicándose mediante una API estandarizada con autenticación JWT.

---

## Arquitectura

```
coders-app/
│
├── backend/                        # API REST - Node.js + Express
│   └── src/
│       ├── config/                 # Configuración de DB
│       ├── controllers/            # HTTP handlers (request/response)
│       ├── data/                   # Persistencia en archivos JSON
│       ├── middleware/              # JWT auth + RBAC middleware
│       ├── models/                 # Data access layer (CRUD)
│       ├── routes/                 # Route definitions + middleware chains
│       └── services/               # Business logic + data enrichment
│
├── frontend/                       # SPA - React 19 + TypeScript + Vite
│   └── src/
│       ├── api/                    # Axios client + interceptors
│       ├── components/             # UI components (shadcn/ui + custom)
│       ├── hooks/                  # React Query hooks (CRUD operations)
│       ├── lib/                    # Utility functions
│       ├── pages/                  # Route-level components
│       ├── stores/                 # Global state (Zustand)
│       └── types/                  # TypeScript interfaces
│
└── package.json                    # Monorepo scripts (concurrently)
```

---

## Stack Tecnológico

<details>
<summary><strong>Backend</strong></summary>

| Paquete | Versión | Función |
|:--------|:-------:|:--------|
| Express | 5.2 | Framework web HTTP |
| bcryptjs | 3.0 | Password hashing (bcrypt, 10 salt rounds) |
| jsonwebtoken | 9.0 | JWT generation & verification |
| uuid | 11.1 | UUID v4 generation |
| cors | 2.8 | Cross-Origin Resource Sharing |
| dotenv | 17.4 | Environment variable management |
| nodemon | 3.1 | Hot reload (dev) |

</details>

<details>
<summary><strong>Frontend</strong></summary>

| Paquete | Versión | Función |
|:--------|:-------:|:--------|
| React | 19.2 | UI library |
| TypeScript | 6.0 | Static typing |
| Vite | 8.1 | Build tool + dev server (HMR) |
| Tailwind CSS | 4.3 | Utility-first CSS |
| shadcn/ui | 4.13 | Component library (Base UI) |
| Zustand | 5.0 | Lightweight state management |
| TanStack Query | 5.101 | Server state + cache management |
| Axios | 1.18 | HTTP client with interceptors |
| React Router DOM | 7.18 | Client-side routing |
| lucide-react | 1.25 | Icon library |
| oxlint | 1.71 | Linting (dev) |

</details>

---

## Modelo de Dominio

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  TeamLeader  │  1:N  │     Clan     │  N:C  │     Coder    │
│──────────────│───────│──────────────│───────│──────────────│
│ id (UUID)    │       │ id (UUID)    │       │ id (UUID)    │
│ name         │       │ name         │       │ name         │
│ email        │       │ description  │       │ email        │
│ password (*) │       │ teamLeader ◄─┼───────│ password (*) │
│ role         │       │ coders[]  ───┼──────►│ clan ◄───────│
│ timestamps   │       │ timestamps   │       │ timestamps   │
└──────────────┘       └──────────────┘       └──────────────┘

(*) Hasheado con bcrypt - nunca se expone en respuestas API
```

### Sistema de Roles (RBAC)

| Operación | Coder | Team Leader | Admin |
|:----------|:-----:|:-----------:|:-----:|
| Ver own profile | ✅ | ✅ | ✅ |
| Listar coders | ✅ | ✅ | ✅ |
| Crear / Editar / Eliminar coders | ❌ | ✅ | ✅ |
| Listar clans | ✅ | ✅ | ✅ |
| Crear / Editar / Eliminar clans | ❌ | ✅ | ✅ |
| Gestionar team leaders | ❌ | ❌ | ✅ |
| Cambiar estado de tareas | ❌ | ✅ | ✅ |
| Eliminar / Restaurar tareas | ❌ | ❌ | ✅ |

---

## API Reference

### Autenticación

| Método | Endpoint | Descripción | Auth |
|:------:|:---------|:------------|:----:|
| `POST` | `/api/auth/register` | Registrar usuario | - |
| `POST` | `/api/auth/login` | Login → JWT | - |
| `GET` | `/api/auth/me` | Perfil del usuario actual | Bearer |

### Coders

| Método | Endpoint | Descripción | Rol requerido |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/coders` | Listar todos | Auth |
| `GET` | `/api/coders/:id` | Obtener por ID | Auth |
| `POST` | `/api/coders` | Crear nuevo | teamLeader, admin |
| `PUT` | `/api/coders/:id` | Actualizar | teamLeader, admin |
| `DELETE` | `/api/coders/:id` | Eliminar | teamLeader, admin |

### Clans

| Método | Endpoint | Descripción | Rol requerido |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/clans` | Listar todos | Auth |
| `GET` | `/api/clans/:id` | Obtener por ID | Auth |
| `POST` | `/api/clans` | Crear nuevo | teamLeader, admin |
| `PUT` | `/api/clans/:id` | Actualizar | teamLeader, admin |
| `DELETE` | `/api/clans/:id` | Eliminar | teamLeader, admin |

### Team Leaders

| Método | Endpoint | Descripción | Rol requerido |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/team-leaders` | Listar todos | admin |
| `GET` | `/api/team-leaders/:id` | Obtener por ID | admin |
| `POST` | `/api/team-leaders` | Crear nuevo | admin |
| `POST` | `/api/team-leaders/promote` | Promover coder a TL | admin |
| `POST` | `/api/team-leaders/demote` | Degradar TL a coder | admin |
| `PUT` | `/api/team-leaders/:id` | Actualizar | admin |
| `DELETE` | `/api/team-leaders/:id` | Eliminar | admin |

### Tasks

| Método | Endpoint | Descripción | Rol requerido |
|:------:|:---------|:------------|:-------------:|
| `GET` | `/api/tasks` | Listar tareas (filtrado por rol) | Auth |
| `GET` | `/api/tasks/deleted` | Tareas eliminadas (soft delete) | admin |
| `GET` | `/api/tasks/:id` | Obtener por ID | Auth |
| `POST` | `/api/tasks` | Crear nueva tarea | teamLeader, admin |
| `PATCH` | `/api/tasks/:id/status` | Cambiar estado | teamLeader, admin |
| `PUT` | `/api/tasks/:id` | Actualizar tarea | teamLeader, admin |
| `POST` | `/api/tasks/:id/restore` | Restaurar tarea eliminada | admin |
| `DELETE` | `/api/tasks/:id` | Eliminar (soft delete) | admin |

---

## Flujo de Autenticación

```
┌─────────┐      POST /auth/login        ┌─────────┐
│  Client │ ─────────────────────-─────► │  API    │
│         │                              │         │
│         │ ◄─────────────────────────── │         │
│         │      { user, token (JWT) }   │         │
└────┬────┘                              └─────────┘
     │
     │  localStorage.setItem('token', jwt)
     │
     │  GET /api/coders
     │  Authorization: Bearer <token>
     │
     │         ┌──────────────────┐
     └────────►│ authenticate MW  │──► jwt.verify()
               │                  │──► req.user = decoded
               │ authorize MW     │──► role check
               └──────────────────┘
```

1. El cliente envía credenciales → el backend valida con `bcrypt.compare`
2. Se genera un JWT con `id`, `email`, `role` (expira en 24h)
3. El token se almacena en `localStorage` y se envía en cada request via `Authorization: Bearer`
4. El middleware `authenticate` valida firma y expiración del JWT
5. El middleware `authorize` verifica que el rol esté dentro de los permitidos
6. En error 401, el interceptor de Axios limpia el token y redirige al login

---

## Flujo de Tareas (Task Board)

```
  ┌─────────┐    assignee marca     ┌──────────┐   teamLeader/admin    ┌──────────┐
  │ PENDING │ ──────────────────►   │  REVIEW  │ ──────────────────►   │ APPROVED │
  └─────────┘    "Mark for Review"  └──────────┘   Approve             └──────────┘
                                                          │
                                                          │ Reject
                                                          ▼
                                                     ┌──────────┐
                                                     │ REJECTED │
                                                     └──────────┘
                                                          │
                                                          │ Reopen (admin/TL)
                                                          ▼
                                                     ┌─────────┐
                                                     │ PENDING │
                                                     └─────────┘
```

- **Coders** solo pueden mover tareas de `pending` → `review`
- **Team Leaders** y **Admins** pueden aprobar, rechazar o reabrir tareas
- **Admins** pueden eliminar tareas (soft delete) y restaurarlas desde el panel de tareas eliminadas
- Las tareas `approved` son estado final (no admiten transiciones)

### Task Board Features

| Característica | Descripción |
|:---------------|:------------|
| **Vista Kanban** | 4 columnas: Pending, In Review, Approved, Rejected |
| **Filtrado por rol** | Coders ven solo sus tareas. TLs ven las de sus clans. Admins ven todas. |
| **Prioridades** | High (rojo), Medium (amarillo), Low (verde) - ordenadas por defecto |
| **Panel de eliminadas** | Admins pueden ver, restaurar o eliminar tareas permanentemente |
| **Prioridades ancladas** | Tareas `high` tienen borde lateral rojo para destacar visualmente |

---

## Optimizaciones de Rendimiento

| Optimización | Detalle |
|:-------------|:--------|
| **React Query staleTime** | Caché de 30s evita re-fetches innecarios al navegar entre páginas del dashboard. |
| **Lazy loading de tareas eliminadas** | La query de tareas eliminadas solo se ejecuta cuando el admin abre el panel, no al montar el componente. |
| **Desactivar refetchOnWindowFocus** | Evita requests adicionales al cambiar de pestaña del navegador. |
| **Interceptores Axios** | El token se inyecta automáticamente en cada request y se limpia en respuestas 401, evitando tokens expirados. |

---

## Persistencia

Los datos se almacenan en **archivos JSON** dentro de `backend/src/data/`:

| Archivo | Entidad |
|:--------|:--------|
| `coders.json` | Coders |
| `clans.json` | Clans |
| `teamLeaders.json` | Team Leaders |
| `tasks.json` | Tasks (incluye soft-deleted) |

> Se incluye `config/db.js` preparado para migrar a **MongoDB** (Mongoose) en el futuro.

---

## Instalación

### Prerrequisitos

- **Node.js** >= 18
- **npm** (incluido con Node)

### Setup

```bash
# 1. Clonar el repositorio
git clone https://github.com/David-devT/coders-app.git
cd coders-app

# 2. Instalar dependencias del monorepo
npm install

# 3. Instalar dependencias del backend
cd backend && npm install

# 4. Instalar dependencias del frontend
cd ../frontend && npm install

# 5. Volver a la raíz
cd ..
```

### Variables de Entorno

Crear el archivo `backend/.env`:

```env
APP_PORT=3000
JWT_SECRET=tu_clave_secreta_aqui
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

| Servicio | URL | Herramienta |
|:---------|:----|:------------|
| Backend API | `http://localhost:3000` | Nodemon (hot reload) |
| Frontend | `http://localhost:5173` | Vite (HMR) |

> El frontend hace proxy automático de `/api` al backend en `localhost:3000`.

### Scripts

| Comando | Descripción |
|:--------|:------------|
| `npm run dev` | Backend + Frontend concurrentemente |
| `npm run dev:backend` | Solo backend (nodemon) |
| `npm run dev:frontend` | Solo frontend (Vite) |

---

## Decisiones de Diseño

| Decisión | Detalle |
|:---------|:--------|
| **Arquitectura en capas** | Routes → Controllers → Services → Models. Separación clara de responsabilidades. |
| **Enriquecimiento de datos** | Los services transforman IDs referenciados en objetos con datos resumidos antes de retornar al controller. |
| **Limpieza en cascade** | Eliminar un Clan desasocia sus coders. Eliminar un Coder lo limpia de sus clans. Eliminar un Team Leader desasocia sus clans. |
| **Sanitización de passwords** | El campo `password` (hash bcrypt) nunca se retorna al cliente en ninguna respuesta API. |
| **Cache invalidation** | React Query invalida caché de entidades relacionadas en cada mutación para mantener consistencia. |
| **JWT stateless** | Tokens firmados con expiración de 24h. Sin refresh tokens - el usuario re-inicia sesión al expirar. |
| **Validación de transiciones** | Las tareas siguen un flujo de estados estricto: pending → review → approved/rejected. No se permiten saltos ni retrocesos no válidos. |
| **Soft delete** | Las tareas eliminadas se marcan como `deleted` en lugar de borrarse físicamente, permitiendo restauración por admin. |
| **Respuestas API estandarizadas** | Todas las respuestas siguen el formato `{ ok: boolean, data: T, message?: string }` para consistencia en el cliente. |

---

