# AGENTS

Project: Real-time Collaborative VTT Platform (Phase 0+1)

You are a FullStackDeveloper working in this monorepo. Follow these conventions and instructions before making changes. This document is authoritative for development workflow in this repository.

High-level Goals
- Monorepo using pnpm workspaces
- Frontend: React 19 + TypeScript + Vite 7
- Backend: Node.js 22 LTS + Express 5 (TypeScript)
- Database: PostgreSQL via Prisma ORM
- Real-time: Socket.IO 4 + Redis adapter
- Infra for local dev: Docker Compose (Postgres, Redis, Mailpit for dev email)
- Auth: Email/password with email verification, session-based auth with Redis store, forgot/reset password
- Campaigns: CRUD-lite and membership by invite links (Player/Spectator), list user campaigns
- Real-time presence in campaign rooms with join/leave events and online list

Runtime & Tooling Versions
- Node.js: 22.x LTS (engines >=22.10 <23). Provide .nvmrc with 22
- pnpm: 9.x
- TypeScript: ^5.6.3
- React: ^19.2.0, react-dom: ^19.2.0, react-router-dom: ^6.28.0 (or latest 6.x)
- Vite: ^7.2.2, @vitejs/plugin-react-swc
- Express: ^5.1.0
- Socket.IO (server/client): ^4.8.1
- Prisma ORM: ^6.1.0, @prisma/client to match
- Redis client: ioredis ^5.4.1
- Sessions: express-session ^1.18.1, connect-redis ^7.2.0
- Validation: zod ^3.23.x
- Hashing: bcrypt ^5.1.1
- HTTP client (web): axios ^1.7.x or fetch with a small wrapper
- State mgmt (web): TanStack Query ^5.x
- Lint/format: eslint + prettier (lightweight sensible defaults)

Repository Structure (target)
- package.json (workspace root, scripts)
- pnpm-workspace.yaml
- .editorconfig, .gitignore, .nvmrc
- .env.example at repo root with required env vars
- docker-compose.yml (postgres, redis, mailpit)
- apps/
  - server/ (Express 5 + Prisma + Socket.IO)
  - web/ (React 19 + Vite)
- packages/
  - shared/ (TS types, zod schemas, socket event contracts)
- prisma/ (only if placed at repo root; otherwise under apps/server/prisma)
- docs/ (owned by Tech Lead; do not edit unless explicitly asked)

Environment (local)
- Postgres: postgres:16-alpine, DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vtt?schema=public
- Redis: redis:7-alpine, REDIS_URL=redis://localhost:6379
- Mailpit: axllent/mailpit: latest; SMTP on 1025, UI on 8025
- App secrets for dev: use .env and .env.local. Provide .env.example with placeholders

Security & Auth Strategy
- Use cookie-based session auth for SPA: express-session stored in Redis
- Cookie settings: httpOnly, sameSite=lax (development), secure=false (dev), name="vtt.sid"
- Session TTL: 30 days, rolling: true
- Hash passwords with bcrypt (12 rounds). Enforce minimum strength on signup
- Email verification and password reset implemented via signed, expiring tokens stored in DB (Prisma models)

Database (Prisma) — initial models
- User: id (cuid), email (unique), username (unique), passwordHash, createdAt, verifiedAt
- Campaign: id, name, description, gameSystem, ownerId (User)
- Membership: id, userId, campaignId, role (enum: GM, PLAYER, SPECTATOR), createdAt, unique(userId+campaignId)
- Invite: id, code (string, unique), campaignId, role (enum: PLAYER/SPECTATOR), expiresAt (nullable), maxUses (nullable), uses (int), createdById
- EmailToken: id, userId, token, type (enum: VERIFY_EMAIL | RESET_PASSWORD), expiresAt, consumedAt (nullable)

API Surface (Phase 0+1)
- Auth: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, POST /api/auth/forgot, POST /api/auth/reset, GET /api/auth/verify?token=...
- Campaigns: POST /api/campaigns, GET /api/campaigns (user’s list with role & member count), GET /api/campaigns/:id, PATCH /api/campaigns/:id, DELETE /api/campaigns/:id (GM only), POST /api/campaigns/:id/leave
- Invites: POST /api/campaigns/:id/invites, GET /api/campaigns/:id/invites, DELETE /api/invites/:code, POST /api/invites/:code/join
- Members: GET /api/campaigns/:id/members, DELETE /api/campaigns/:id/members/:userId (GM only)
- Health: GET /healthz, GET /readyz

Socket.IO (Phase 0+1)
- Namespace: /campaigns, Room: campaign:<id>
- Auth via session cookie; reject unauthenticated sockets
- Events (server <-> client):
  - presence:online-list { users: Array<{id, username, role}> }
  - presence:user-joined { user }
  - presence:user-left { userId }
  - campaign:updated { id, name, description }
  - membership:added { member }, membership:removed { userId }
- Use @socket.io/redis-adapter for multi-instance support
- Auto-reconnect on client, show connection status

Local Dev Commands (expected)
- pnpm i — install
- pnpm infra:up — docker compose up -d (db/redis/mail)
- pnpm infra:down — docker compose down -v
- pnpm db:migrate — prisma migrate dev
- pnpm db:seed — seed development data
- pnpm dev — start web and server in watch mode concurrently

Coding Standards
- TypeScript strict mode on
- Use zod for request validation (backend) and shared schemas where possible
- Never commit secrets; provide .env.example
- Keep API handlers thin; encapsulate domain logic in services
- Ensure unit or integration tests for critical flows (auth, invite join). At minimum, happy-path tests for core APIs

What NOT to build in this phase
- Gameplay features (maps, tokens, dice, chat, etc.)
- OAuth/social login
- Payments

Process
1) Before coding, run: pnpm i; pnpm infra:up
2) Implement your task; update scripts as needed
3) Run: pnpm db:migrate; pnpm db:seed (if schema changed)
4) Start services: pnpm dev
5) Manually test acceptance criteria relevant to your task
6) Commit changes with clear messages

Do not modify AGENTS.md or docs/ unless explicitly asked. Do not change project layout outside of apps/* and packages/* without strong reason.

