# Coders App

Plataforma de gestión de equipos de desarrollo organizados por **Clans**, liderados por **Team Leaders** y compuestos por **Coders**. Aplicación fullstack con arquitectura monorepo, backend REST API y frontend SPA.

---

## Arquitectura General

```
proyect 1/
├── backend/          # API REST (Node.js + Express)
│   └── src/
│       ├── config/       # Configuración de base de datos
│       ├── controllers/  # Capa de controladores (HTTP handlers)
│       ├── data/         # Persistencia en archivos JSON
│       ├── middleware/    # Autenticación JWT y autorización por roles
│       ├── models/       # Modelos de datos (CRUD sobre JSON files)
│       ├── routes/       # Definición de rutas REST
│       └── services/     # Lógica de negocio
├── frontend/         # SPA (React 19 + TypeScript + Vite)
│   └── src/
│       ├── api/          # Capa de clientes HTTP (Axios)
│       ├── components/   # Componentes UI (shadcn/ui + custom)
│       ├── hooks/        # Custom hooks (React Query + CRUD)
│       ├── lib/          # Utilidades (cn para Tailwind)
│       ├── pages/        # Páginas (Login, Dashboard)
│       ├── stores/       # Estado global (Zustand)
│       └── types/        # Definiciones TypeScript
├── package.json          # Scripts de desarrollo (concurrently)
└── README.md
```

---

## Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| **Node.js** | LTS | Runtime de JavaScript |
| **Express** | 5.2 | Framework web REST API |
| **bcryptjs** | 3.0 | Hashing de contraseñas (10 rounds salt) |
| **jsonwebtoken** | 9.0 | Generación y verificación de tokens JWT |
| **uuid** | 11.1 | Generación de IDs únicos v4 |
| **cors** | 2.8 | Habilitación de Cross-Origin Resource Sharing |
| **dotenv** | 17.4 | Gestión de variables de entorno |
| **nodemon** | 3.1 | Hot reload en desarrollo (devDependency) |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2 | Librería de UI declarativa |
| **TypeScript** | 6.0 | Tipado estático |
| **Vite** | 8.1 | Bundler y dev server con HMR |
| **Tailwind CSS** | 4.3 | Framework de utilidades CSS |
| **shadcn/ui** | 4.13 | Componentes UI preexistentes (Base UI) |
| **Zustand** | 5.0 | Estado global ligero |
| **TanStack React Query** | 5.101 | Gestión de estado asíncrono y caché |
| **Axios** | 1.18 | Cliente HTTP con interceptores |
| **React Router DOM** | 7.18 | Enrutamiento SPA |
| **lucide-react** | 1.25 | Iconografía |
| **class-variance-authority** | 0.7 | Variantes de componentes |
| **oxlint** | 1.71 | Linting (devDependency) |

---

## Modelo de Datos

### Entidades

```
TeamLeader (1) ──── (N) Clan (N) ──── (N) Coder
```

- **Coder**: Miembro técnico de un clan. Campos: `id`, `name`, `email`, `password` (hash), `clan` (ref), timestamps.
- **Clan**: Unidad organizativa. Campos: `id`, `name`, `description`, `teamLeader` (ref), `coders[]` (refs), timestamps.
- **TeamLeader**: Gestor con rol jerárquico. Campos: `id`, `name`, `email`, `password` (hash), `role` (`teamLeader` | `admin`), timestamps.

### Roles y Permisos

| Acción | Coder | Team Leader | Admin |
|---|---|---|---|
| Ver coders | ✅ | ✅ | ✅ |
| Crear/Editar/Eliminar coders | ❌ | ✅ | ✅ |
| Ver clans | ✅ | ✅ | ✅ |
| Crear/Editar/Eliminar clans | ❌ | ✅ | ✅ |
| Gestionar team leaders | ❌ | ❌ | ✅ |

---

## Persistencia

El backend utiliza **archivos JSON** como capa de persistencia (archivos en `backend/src/data/`). Cada entidad tiene su archivo:

- `coders.json`
- `clans.json`
- `teamLeaders.json`

> Nota: Existe un módulo `config/db.js` preparado para conexión a MongoDB via Mongoose, habilitado para una futura migración.

---

## Endpoints de la API

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de usuario | No |
| `POST` | `/api/auth/login` | Login y obtención de JWT | No |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado | Token |

### Coders

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/api/coders` | Listar todos | Autenticado |
| `GET` | `/api/coders/:id` | Obtener por ID | Autenticado |
| `POST` | `/api/coders` | Crear coder | teamLeader / admin |
| `PUT` | `/api/coders/:id` | Actualizar coder | teamLeader / admin |
| `DELETE` | `/api/coders/:id` | Eliminar coder | teamLeader / admin |

### Clans

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/api/clans` | Listar todos | Autenticado |
| `GET` | `/api/clans/:id` | Obtener por ID | Autenticado |
| `POST` | `/api/clans` | Crear clan | teamLeader / admin |
| `PUT` | `/api/clans/:id` | Actualizar clan | teamLeader / admin |
| `DELETE` | `/api/clans/:id` | Eliminar clan | teamLeader / admin |

### Team Leaders

| Método | Ruta | Descripción | Rol |
|---|---|---|---|
| `GET` | `/api/team-leaders` | Listar todos | admin |
| `GET` | `/api/team-leaders/:id` | Obtener por ID | admin |
| `POST` | `/api/team-leaders` | Crear team leader | admin |
| `PUT` | `/api/team-leaders/:id` | Actualizar team leader | admin |
| `DELETE` | `/api/team-leaders/:id` | Eliminar team leader | admin |

---

## Flujo de Autenticación

1. **Login**: El cliente envía `email` + `password` → el backend valida credenciales con `bcrypt.compare` → genera un JWT con `id`, `email`, `role` (expira en 24h) → retorna `{ user, token }`.
2. **Request autenticado**: El cliente almacena el token en `localStorage` y lo envía en cada petición via header `Authorization: Bearer <token>`.
3. **Middleware `authenticate`**: Valida la firma y expiración del JWT. Adjunta el payload decodificado a `req.user`.
4. **Middleware `authorize`**: Verifica que `req.user.role` esté dentro de los roles permitidos para la ruta.
5. **Refresh automático**: Al recibir un 401, el interceptor de Axios limpia el token y redirige al login.

---

## Instalación y Desarrollo

### Prerrequisitos

- Node.js >= 18
- npm

### Instalación

```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias de cada workspace
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Variables de Entorno

Crear `backend/.env`:

```env
APP_PORT=3000
JWT_SECRET=tu_secreto_jwt_aqui
```

### Ejecución en Desarrollo

```bash
# Ejecutar backend y frontend simultáneamente
npm run dev
```

Esto ejecuta:
- **Backend** en `http://localhost:3000` (con nodemon)
- **Frontend** en `http://localhost:5173` (con Vite HMR)

El frontend hace proxy de `/api` al backend automáticamente.

### Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Ejecutar backend + frontend concurrentemente |
| `npm run dev:backend` | Solo backend con nodemon |
| `npm run dev:frontend` | Solo frontend con Vite |

---

## Decisiones de Diseño

- **Patrón en capas** (backend): Routes → Controllers → Services → Models. Separación clara de responsabilidades.
- **Servicios enriquecedores**: Los services transforman IDs referenciados en objetos con datos resumidos antes de retornar al controller.
- **Limpieza automática de referencias**: Al eliminar un Clan se desasocian sus coders; al eliminar un Coder se limpia de sus clans; al eliminar un Team Leader se desasocian sus clans.
- **Sanitización de datos**: El campo `password` (hash) nunca se retorna al cliente en respuestas API.
- **Estado derivado en frontend**: React Query invalida caché de entidades relacionadas en cada mutación (ej: eliminar un coder invalida `clans` también).

---