<div align="center">

# ⚡ Coders App

### Plataforma Fullstack de Gestión y Coordinación de Equipos Técnicos

**Organiza y gestiona desarrolladores en Clans, liderados por Team Leaders y estructurados en tableros Kanban.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📌 Descripción

**Coders App** es una plataforma web fullstack modular diseñada para la administración y monitoreo de equipos de desarrollo de software. Permite agrupar coders en **Clans** (unidades funcionales de trabajo), cada uno coordinado por un **Team Leader**, bajo un esquema de control de acceso basado en roles (**RBAC**) jerárquico.

La aplicación opera bajo una arquitectura **Monorepo** con desacoplamiento entre el backend (API REST construida con Express) y el frontend (Single Page Application con React y TypeScript), comunicándose a través de una API estandarizada y segura mediante tokens **JWT**.

---

## 🚀 Características Principales

- 🛡️ **Control de Acceso Basado en Roles (RBAC)**: Tres niveles de autorización jerárquica (*Coder*, *Team Leader* y *Admin*).
- 📂 **Gestión de Clans y Coders**: Creación, asignación, actualización y desvinculación automática en cascada con regla de negocio de hasta 2 Clans por Team Leader.
- 🔄 **Promoción y Degradación Dinámica**: Capacidad de promover Coders a Team Leaders y degradar Team Leaders a Coders con migración automática de tareas asignadas.
- 📋 **Tablero Kanban con Transición Estricta de Estados**: Flujo validado de tareas (`Pending` → `Review` → `Approved` / `Rejected` → `Pending`).
- 🗑️ **Soft Delete & Restore**: Eliminación lógica y panel de restauración de tareas exclusivo para administradores.
- ⚡ **Enriquecimiento de Datos en Backend**: Respuestas API con objetos referenciados resueltos para minimizar peticiones adicionales del cliente.
- 🔒 **Seguridad y Sanitización**: Contraseñas cifradas con `bcrypt` (10 rounds) que jamás se exponen en las respuestas de la API.

---

## 🏗️ Arquitectura del Sistema

```
coders-app/
├── backend/                        # API REST - Node.js + Express
│   └── src/
│       ├── config/                 # Conectores y configuración de base de datos
│       ├── controllers/            # Controladores HTTP (request / response)
│       ├── data/                   # Persistencia local JSON (ignorado por Git)
│       ├── middleware/             # Middlewares de JWT auth y RBAC
│       ├── models/                 # Capa de persistencia y operaciones CRUD
│       ├── routes/                 # Definición de rutas y cadenas de middleware
│       ├── scripts/                # Scripts de seed y pruebas automatizadas E2E
│       ├── services/               # Lógica de negocio y enriquecimiento
│       ├── index.js                # Punto de entrada del servidor
│       └── server.js               # Configuración de Express, CORS y rutas
│
├── frontend/                       # SPA - React 19 + TypeScript + Vite
│   └── src/
│       ├── api/                    # Cliente HTTP Axios e interceptores
│       ├── components/             # Componentes modulares de UI (Clans, Coders, Tasks, etc.)
│       ├── hooks/                  # Custom hooks con TanStack Query
│       ├── lib/                    # Utilidades y configuración de clases
│       ├── pages/                  # Vistas principales (LoginPage, DashboardPage)
│       ├── stores/                 # Gestión de estado global con Zustand
│       └── types/                  # Interfaces y tipos de TypeScript
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
| **bcryptjs** | 3.x | Cifrado y validación de contraseñas (10 salt rounds) |
| **jsonwebtoken** | 9.x | Emisión y verificación de tokens de acceso JWT (24h) |
| **uuid** | 11.x | Generación de identificadores únicos UUID v4 |
| **cors** | 2.x | Habilitación de Cross-Origin Resource Sharing |
| **dotenv** | 17.x | Gestión de variables de entorno |

### Frontend
| Tecnología | Versión | Propósito |
|:---|:---:|:---|
| **React** | 19.x | Biblioteca de interfaces de usuario |
| **TypeScript** | 5.x / 6.x | Tipado estático y robustez del código |
| **Vite** | 8.x | Herramienta de compilación y servidor HMR |
| **Tailwind CSS** | 4.x | Estilos y diseño responsivo |
| **Zustand** | 5.x | Manejo reactivo de estado global |
| **TanStack Query** | 5.x | Gestión de estado asíncrono y caché de servidor |
| **Axios** | 1.x | Cliente HTTP con interceptores de autorización |
| **React Router** | 7.x | Enrutamiento del lado del cliente |
| **Lucide React** | 1.x | Iconografía vectorial |

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

(*) Contraseñas cifradas irreversiblemente - excluidas de todas las respuestas públicas
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
| `POST` | `/api/auth/login` | Autenticación y generación de JWT | Público |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado | Bearer Token |

### Coders
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/coders` | Listar todos los coders | Autenticado |
| `GET` | `/api/coders/:id` | Obtener coder por ID | Autenticado |
| `POST` | `/api/coders` | Crear nuevo coder | `teamLeader`, `admin` |
| `PUT` | `/api/coders/:id` | Actualizar coder existente | `teamLeader`, `admin` |
| `DELETE` | `/api/coders/:id` | Eliminar coder y desvincular tareas/clans | `teamLeader`, `admin` |

### Clans
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/clans` | Listar todos los clans con líderes y coders | Autenticado |
| `GET` | `/api/clans/:id` | Obtener clan por ID | Autenticado |
| `POST` | `/api/clans` | Crear nuevo clan (máximo 2 por TL) | `teamLeader`, `admin` |
| `PUT` | `/api/clans/:id` | Actualizar información del clan | `teamLeader`, `admin` |
| `DELETE` | `/api/clans/:id` | Eliminar clan y desasociar miembros | `teamLeader`, `admin` |

### Team Leaders
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/team-leaders` | Listar todos los Team Leaders | `teamLeader`, `admin` |
| `GET` | `/api/team-leaders/:id` | Obtener Team Leader por ID | `admin` |
| `POST` | `/api/team-leaders` | Crear nuevo Team Leader | `admin` |
| `POST` | `/api/team-leaders/promote` | Promover Coder a Team Leader | `admin` |
| `POST` | `/api/team-leaders/demote` | Degradar Team Leader a Coder | `admin` |
| `PUT` | `/api/team-leaders/:id` | Actualizar Team Leader | `admin` |
| `DELETE` | `/api/team-leaders/:id` | Eliminar Team Leader | `admin` |

### Tareas (Tasks)
| Método | Endpoint | Descripción | Rol Requerido |
|:---:|:---|:---|:---:|
| `GET` | `/api/tasks` | Listar tareas activas (filtradas por rol) | Autenticado |
| `GET` | `/api/tasks/deleted` | Listar tareas archivadas (Soft Delete) | `admin` |
| `GET` | `/api/tasks/:id` | Obtener tarea por ID | Autenticado |
| `POST` | `/api/tasks` | Crear nueva tarea | `teamLeader`, `admin` |
| `PATCH` | `/api/tasks/:id/status` | Actualizar estado según flujo Kanban | Autenticado *(validado por RBAC)* |
| `PUT` | `/api/tasks/:id` | Actualizar información de la tarea | `teamLeader`, `admin` |
| `POST` | `/api/tasks/:id/restore` | Restaurar tarea archivada | `admin` |
| `DELETE` | `/api/tasks/:id` | Archivar tarea (Soft Delete) | `admin` |

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

### 1. Clonar el repositorio
```bash
git clone https://github.com/David-devT/coders-app.git
cd coders-app
```

### 2. Instalar dependencias del Monorepo
```bash
# Instala las dependencias en la raíz, backend y frontend
npm run install:all
```

### 3. Configuración de Variables de Entorno
Crear el archivo `backend/.env` con la configuración del servicio:

```env
APP_PORT=3000
JWT_SECRET=tu_clave_secreta_jwt_aqui
```

### 4. Inicializar Datos de Prueba (Seed)
```bash
npm run seed
```

### 5. Ejecutar la Aplicación en Desarrollo
```bash
# Inicia backend (Nodemon) y frontend (Vite) concurrentemente
npm run dev
```

| Servicio | URL Local | Descripción |
|:---|:---|:---|
| **Frontend SPA** | `http://localhost:5173` | Interfaz de usuario con Vite HMR |
| **Backend API** | `http://localhost:3000` | Servidor API REST con hot-reload |

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|:---|:---|
| `npm run dev` | Ejecuta backend y frontend en paralelo con hot-reload |
| `npm run dev:backend` | Ejecuta únicamente el servidor backend |
| `npm run dev:frontend` | Ejecuta únicamente el cliente frontend |
| `npm run seed` | Carga los datos de prueba iniciales en el backend |
| `npm --prefix backend run test` | Ejecuta la suite de pruebas de integración de la API |
| `npm --prefix frontend run build` | Compila el frontend para producción con TypeScript |

---

## 🔒 Consideraciones de Seguridad y Buenas Prácticas

- **Persistencia Segura**: Los datos locales se almacenan en `backend/src/data/`, directorio protegido y excluido en `.gitignore`.
- **Credenciales Aisladas**: Las credenciales de acceso iniciales se gestionan fuera del control de versiones mediante `credentials.txt` (ignorado en Git).
- **Protección de Passwords**: Nunca se retornan contraseñas en ninguna petición HTTP.
- **Validación en Capas**: Todas las reglas de negocio (como el límite de 2 clanes por Team Leader o las transiciones válidas de tareas) se validan estrictamente en la capa de servicios del backend.

---

<div align="center">
Desarrollado con arquitectura fullstack modular y buenas prácticas de ingeniería de software.
</div>
