# SLA Ticketing System — Backend

A production-grade NestJS API powering a multi-role helpdesk and SLA ticketing platform, with Prisma + PostgreSQL (via Supabase) and JWT cookie-based authentication.

**Live API:** hosted on Render
**Frontend repo:** [nextjs-sla-ticketing](https://github.com/TanishSharma151/nextjs-sla-ticketing)

## Features

- JWT authentication via HTTP-only cookies (`SameSite=None; Secure` for cross-origin use)
- Role-based access control (Admin, Agent, Client) with live role resolution — permission changes apply immediately without re-login
- Organization & membership management
- Ticket lifecycle management: creation, assignment, status transitions
- SLA policy engine — configurable response/resolution times per priority, with automatic due-date calculation and breach detection
- Status-aware SLA pause/resume logic
- Comments and full audit trail via ticket events
- Email notifications (ticket created, resolved, assigned) via Resend
- File attachment support
- Input validation via `class-validator` with strict DTO whitelisting

## Tech Stack

- **Framework:** NestJS, TypeScript
- **ORM / DB:** Prisma, PostgreSQL (Supabase)
- **Auth:** Passport JWT strategy, cookies via `cookie-parser`, bcrypt password hashing
- **Email:** Resend
- **Validation:** class-validator, class-transformer

## Architecture Notes

- **Cross-origin auth:** Cookies are configured with `httpOnly`, `secure`, and `sameSite: 'none'` to support a separate-domain frontend (Vercel). The frontend proxies requests through its own API routes so cookies are treated as first-party by the browser.
- **Live role resolution:** Rather than baking the user's role into the JWT payload, `JwtStrategy.validate()` fetches the current membership/role from the database on every request — so role changes made via the admin panel take effect immediately.
- **SLA engine:** On ticket creation, the matching `SlaPolicy` (by priority + organization) determines `slaDueAt`. Status transitions to `RESOLVED`/`CLOSED` clear the breach flag.

## Getting Started

```bash
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3001
RESEND_API_KEY=your-resend-key
PORT=3000
```

Run migrations and start the dev server:

```bash
npx prisma migrate dev
npm run start:dev
```

## Project Structure

```
src/
  auth/             # Signup, login, JWT strategy, guards
  organizations/    # Org & member management
  tickets/          # Ticket CRUD, assignment, status, SLA logic
  sla-policy/       # SLA policy CRUD
  mail/             # Email notification service
  common/           # Shared utils (SLA date calculation, etc.)
  prisma/           # Prisma service/module
```

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login, sets `access_token` cookie |
| GET | `/auth/me` | Get current user + memberships |
| GET | `/tickets` | List tickets (role-scoped) |
| POST | `/tickets` | Create a ticket |
| PATCH | `/tickets/:id/status` | Update ticket status |
| PATCH | `/tickets/:id/assign` | Assign ticket (admin only) |
| GET/POST | `/sla-policy` | Manage SLA policies |
| GET/PATCH | `/organizations/:id/members` | Manage org members & roles |

## Related Repo

Frontend (Next.js + Tailwind): [nextjs-sla-ticketing](https://github.com/TanishSharma151/nextjs-sla-ticketing)
