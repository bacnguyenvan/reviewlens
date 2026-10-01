# ReviewLens

Turn app reviews into actionable product insights.

ReviewLens is a tool that helps developers analyze app reviews, identify common complaints, discover feature requests, and extract actionable product insights using AI.

## Tech Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Frontend        | React, Vite, TypeScript       |
| Styling         | Tailwind CSS                  |
| Backend         | Node.js, Fastify, TypeScript  |
| Shared          | TypeScript                    |
| Package Manager | pnpm                          |
| AI              | OpenAI API (planned)          |
| Database        | Supabase PostgreSQL (planned) |

## Prerequisites

Make sure the following tools are installed:

- **Node.js:** 20.19.0 or later (Node.js 22 LTS recommended)
- **pnpm:** 10.x
- **Git**
- **VS Code** (recommended)

Verify your installation:

```bash
node -v
pnpm -v
git --version
```

If pnpm is not installed, enable Corepack:

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

## Getting Started

### 1. Clone the repository

```bash
git clone <REPOSITORY_URL>
cd reviewlens
```

Replace `<REPOSITORY_URL>` with the actual Git repository URL.

### 2. Install dependencies

From the project root:

```bash
pnpm install
```

This installs dependencies for all workspace packages.

### 3. Project structure

```text
reviewlens/
├── apps/
│   ├── web/                  # React frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                  # Fastify backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/               # Shared types and schemas
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
└── README.md
```

### 4. Run the application

Start both frontend and backend from the project root:

```bash
pnpm dev
```

Or start each application separately.

**Frontend:**

```bash
pnpm dev:web
```

URL: http://localhost:5173

**Backend:**

```bash
pnpm dev:api
```

URL: http://localhost:3000

### 5. Verify the backend

Open the health check endpoint:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

If the response is correct, the backend is running.

## Available Scripts

Run these commands from the project root.

| Command          | Description                             |
| ---------------- | --------------------------------------- |
| `pnpm install`   | Install all workspace dependencies      |
| `pnpm dev`       | Start frontend and backend              |
| `pnpm dev:web`   | Start frontend only                     |
| `pnpm dev:api`   | Start backend only                      |
| `pnpm build`     | Build all packages with a build script  |
| `pnpm typecheck` | Run TypeScript checks across workspaces |

## Shared Package

The `packages/shared` workspace contains reusable TypeScript types and schemas shared between the frontend and backend.

Example:

```ts
// packages/shared/src/index.ts

export type HealthResponse = {
  status: "ok";
};
```

Import the shared type in the frontend:

```ts
import type { HealthResponse } from "@reviewlens/shared";
```

Import the same type in the backend:

```ts
import type { HealthResponse } from "@reviewlens/shared";
```

This helps keep API contracts consistent and reduces duplicated type definitions.

When adding a new shared type, export it from `packages/shared/src/index.ts` or from an appropriate module that is re-exported there.

## Environment Variables

Currently, the initial project setup does not require environment variables.

When adding external services such as OpenAI or Supabase:

1. Create a local `.env` file in the relevant application directory.
2. Add the required environment variables.
3. Keep secrets out of source control.
4. Update `.env.example` with variable names and placeholder values.

Never commit real API keys, passwords, or tokens.

For Vite, only variables prefixed with `VITE_` are exposed to frontend code. Never put private secrets in frontend environment variables.

## Development Guidelines

- Use TypeScript for frontend and backend code.
- Keep frontend and backend responsibilities separate.
- Put reusable API contracts and shared schemas in `packages/shared`.
- Keep business logic in backend services rather than route handlers when appropriate.
- Use meaningful commit messages.
- Avoid committing generated files, local environment files, and dependencies.
- Test changes locally before opening a pull request.

### Commit Message Convention

Use a simple conventional commit format:

```text
feat: add review upload
fix: handle invalid CSV files
refactor: extract review analysis service
chore: setup monorepo
docs: update README
```

## Troubleshooting

### pnpm: command not found

Enable Corepack and activate pnpm:

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

If Corepack has a corrupted cache, clear it and retry:

```bash
rm -rf ~/.cache/node/corepack
corepack enable
corepack prepare pnpm@10 --activate
```

### zsh: no matches found

When installing a workspace dependency on macOS using zsh, quote the package specifier:

```bash
pnpm add '@reviewlens/shared@workspace:*'
```

### Workspace package not found

Make sure the root `pnpm-workspace.yaml` includes:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Then run:

```bash
pnpm install
pnpm list -r
```

Verify that the shared package name in `packages/shared/package.json` is `@reviewlens/shared`.

### TypeScript build errors

If a TypeScript build reports errors involving `rootDir` or files outside the source directory, inspect the relevant `tsconfig.json` and shared package configuration.

Do not change the configuration blindly. Check the exact error first, especially when importing TypeScript source files across workspace packages.

### Port already in use

If ports `5173` or `3000` are already occupied, stop the conflicting process or configure a different port in the relevant application.

## Current Development Status

The initial project focuses on establishing the monorepo and development environment.

Planned features:

- [ ] Upload app reviews from CSV
- [ ] Parse and validate review data
- [ ] Analyze reviews using AI
- [ ] Categorize common complaints and feature requests
- [ ] Display actionable insights in a dashboard
- [ ] Integrate a review data source
- [ ] Add persistent storage and authentication
- [ ] Deploy the application

---

## License

To be determined.
