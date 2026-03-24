# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps + generate Prisma client + migrate DB)
npm run setup

# Development server (uses Turbopack + node-compat shim)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/path/to/test.ts

# Reset database
npm run db:reset
```

Tests use Vitest with jsdom environment. Test files live alongside their source in `__tests__/` subdirectories.

## Code Style

Use comments sparingly — only for complex logic that isn't self-evident from the code.

## Architecture

### High-Level Flow

1. User describes a component in the chat UI
2. Chat messages + the current virtual file system are sent to `POST /api/chat`
3. The API route calls Claude via Vercel AI SDK (`streamText`) with two tools: `str_replace_editor` and `file_manager`
4. Claude uses those tools to create/edit files in the `VirtualFileSystem` on the server
5. Tool calls stream back to the client; `FileSystemContext` handles each tool call to mirror the changes client-side
6. `PreviewFrame` detects file system changes, transpiles JSX via Babel standalone, creates blob URLs + an import map, and renders everything inside a sandboxed `<iframe>`

### Key Abstractions

**`VirtualFileSystem`** (`src/lib/file-system.ts`) — In-memory file tree. No files are written to disk. Supports create/read/update/delete/rename with full path normalization. Has `serialize()`/`deserializeFromNodes()` for JSON round-tripping (used when saving to DB and passing to the API route).

**`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — React context wrapping the VFS. Exposes `handleToolCall()` which processes `str_replace_editor` (create/str_replace/insert commands) and `file_manager` (rename/delete) tool calls streamed from the AI.

**`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK's `useChat`. Serializes the VFS and sends it with every message. Forwards tool calls to `FileSystemContext.handleToolCall`.

**`PreviewFrame`** (`src/components/preview/PreviewFrame.tsx`) — Watches `refreshTrigger` from FileSystemContext. On every change, calls `createImportMap()` + `createPreviewHTML()` and sets `iframe.srcdoc`.

**`jsx-transformer.ts`** (`src/lib/transform/jsx-transformer.ts`) — Client-side JSX/TSX transpilation using `@babel/standalone`. Builds an ES module import map: local files become blob URLs, third-party packages resolve via `https://esm.sh/`. Missing local imports get placeholder stub modules.

**AI Tools** (`src/lib/tools/`) — `str-replace.ts` and `file-manager.ts` define the Vercel AI SDK tool schemas that Claude uses to manipulate the VFS server-side during generation.

### Database

The database schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of data stored in the database.

### Auth & Persistence

- JWT sessions via `jose`, stored in an `httpOnly` cookie (`auth-token`). Logic in `src/lib/auth.ts`.
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes.
- Anonymous users can generate components; projects are only persisted to SQLite (Prisma) for authenticated users.
- Prisma client is generated into `src/generated/prisma/` (non-standard output path).
- DB schema: `User` (email + bcrypt password) → `Project` (name, messages JSON, VFS data JSON).

### Running Without an API Key

Set `ANTHROPIC_API_KEY` in `.env` for real generation. Without it, `src/lib/provider.ts` returns a mock provider that streams static code (useful for UI development).

### node-compat.cjs

Required shim (`--require ./node-compat.cjs`) loaded before Next.js starts. Patches Node.js globals needed by Prisma/bcrypt in the Next.js 15 + React 19 environment.
