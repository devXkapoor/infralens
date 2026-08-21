# InfraLens

InfraLens is a full-stack infrastructure visualization platform for modeling
application services, dependencies, deployment metadata, and service health
through an interactive infrastructure canvas.

The project is being developed as a production-oriented engineering project
with a focus on full-stack architecture, API design, relational data modeling,
interactive visualization, and deployment.

## Current Status

InfraLens currently provides:

- Interactive infrastructure topology visualization
- Service nodes with health/status indicators
- Service creation through the UI
- Editable service metadata
- Draggable service nodes
- Persisted service positions
- Service-to-service connections
- PostgreSQL persistence
- REST APIs for projects, services, and connections
- Next.js frontend
- Fastify backend
- Prisma ORM
- Type-safe request validation with Zod

## Architecture

~~~text
┌─────────────────────────────────┐
│         Next.js Frontend        │
│                                 │
│  Infrastructure Canvas         │
│  Service Nodes                 │
│  Service Inspector             │
│  Service Management            │
└───────────────┬─────────────────┘
                │ HTTP / REST
                ▼
┌─────────────────────────────────┐
│          Fastify Backend        │
│                                 │
│  Projects API                  │
│  Services API                  │
│  Connections API               │
│  Request Validation             │
└───────────────┬─────────────────┘
                │ Prisma ORM
                ▼
┌─────────────────────────────────┐
│           PostgreSQL            │
│                                 │
│  Projects                      │
│  Services                      │
│  Connections                   │
└─────────────────────────────────┘
~~~

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- React Flow
- Tailwind CSS

### Backend

- Node.js
- Fastify
- TypeScript
- Zod
- Prisma

### Database

- PostgreSQL

### Engineering Tooling

- ESLint
- TypeScript
- npm
- Git
- GitHub

## Repository Structure

~~~text
infralens/
├── frontend-infralens/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   ├── public/
│   └── package.json
│
├── backend-infralens/
│   ├── src/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── lib/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── package.json
│
├── .gitignore
└── README.md
~~~

## Local Development

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Backend

~~~bash
cd backend-infralens
npm install
~~~

Configure the database connection in `.env`.

Then run:

~~~bash
npx prisma migrate dev
npm run typecheck
npm run dev
~~~

The backend runs on:

~~~text
http://localhost:4000
~~~

### Frontend

In another terminal:

~~~bash
cd frontend-infralens
npm install
~~~

Configure the frontend environment using `.env.example`.

Then run:

~~~bash
npm run dev
~~~

The frontend runs on:

~~~text
http://localhost:3000
~~~

## Validation

Before committing changes, the frontend is validated with:

~~~bash
cd frontend-infralens

npm run lint
npm run build
~~~

The backend is validated with:

~~~bash
cd backend-infralens

npm run typecheck
~~~

## Roadmap

InfraLens is intended to evolve from a manually modeled infrastructure
visualization tool toward a system capable of representing real application
infrastructure and providing useful operational context.

Planned areas include:

- Production deployment
- Real infrastructure ingestion
- Improved topology visualization
- Infrastructure and service metrics
- Historical service health
- Dependency analysis
- Infrastructure health insights
- Authentication
- Multi-project support
- Cloud infrastructure integrations

## Project Status

InfraLens is an actively developed engineering project.

The current implementation establishes the core full-stack foundation:
interactive infrastructure visualization, persistent service modeling,
service relationships, REST APIs, relational data modeling, and a
Next.js/Fastify application architecture.

More advanced infrastructure discovery, observability, and cloud integrations
are planned as subsequent stages of development.
