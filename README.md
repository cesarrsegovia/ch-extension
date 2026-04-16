# Sportsbook Extension

Chrome extension de apuestas deportivas en tiempo real. Muestra partidos en vivo, cuotas y estadísticas directamente desde el navegador.

## Arquitectura

```
extension-test/
├── extension/      # Chrome Extension (React + Vite + Tailwind)
├── backend/        # API REST + WebSocket (NestJS + Prisma)
├── packages/       # Tipos compartidos (@sportsbook/types)
└── docker-compose.yml  # PostgreSQL + Redis
```

**Flujo general:**
1. Docker levanta PostgreSQL (puerto 5433) y Redis (6379)
2. El backend (NestJS) sincroniza datos desde APIs externas de deportes, los persiste en Postgres y los cachea en Redis
3. La extensión se conecta al backend via HTTP y WebSocket para mostrar datos en tiempo real
4. Al hacer build de la extensión, se carga como extensión de Chrome en modo desarrollador

---

## Requisitos

- Node.js >= 20
- pnpm >= 9
- Docker y Docker Compose

---

## Setup inicial

```bash
# Instalar dependencias (desde la raíz del monorepo)
pnpm install
```

Crear el archivo de variables de entorno del backend:

```bash
cp backend/.env.example backend/.env
```

Valores necesarios en `backend/.env`:

```env
DATABASE_URL="postgresql://admin:password@localhost:5433/sportsbook"
REDIS_URL="redis://localhost:6379"
PORT=3000
# API key del proveedor de datos deportivos
SPORTS_API_KEY=your_api_key_here
```

---

## Levantar infraestructura (Docker)

```bash
docker-compose up -d
```

Esto levanta:
- **PostgreSQL** en `localhost:5433` (user: `admin`, pass: `password`, db: `sportsbook`)
- **Redis** en `localhost:6379`

---

## Backend (NestJS)

```bash
cd backend

# Aplicar migraciones de base de datos
npx prisma migrate dev

# Modo desarrollo (hot reload)
pnpm start:dev

# Producción
pnpm build && pnpm start:prod
```

El servidor queda disponible en `http://localhost:3000`.

### Sincronización de datos deportivos

```bash
# Sync general
pnpm sync

# Solo fútbol/soccer
pnpm sync:soccer

# Deportes US (NFL, NBA, etc.)
pnpm sync:us
```

---

## Extension (Chrome)

```bash
cd extension

# Modo desarrollo (Vite con HMR)
pnpm dev
```

### Cargar en Chrome

1. Ir a `chrome://extensions`
2. Activar **Modo desarrollador** (toggle superior derecho)
3. Hacer clic en **Cargar descomprimida**
4. Seleccionar la carpeta `extension/dist` (generada con `pnpm build`)

Para build de producción:

```bash
cd extension
pnpm build
```

---

## Comandos desde la raíz

```bash
# Instalar todas las dependencias
pnpm install

# Levantar infraestructura
docker-compose up -d

# Iniciar backend en dev
pnpm --filter backend start:dev

# Iniciar extension en dev
pnpm --filter extension dev
```

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Extension | React 19, Vite, Tailwind CSS 4, Zustand |
| Backend | NestJS 11, Prisma, Socket.io |
| Base de datos | PostgreSQL 15 |
| Cache | Redis |
| Monorepo | pnpm workspaces |
