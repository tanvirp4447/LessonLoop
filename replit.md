# LessonLoop

## Overview

LessonLoop is a lesson planning web app for early-career teachers. It helps teachers create structured, differentiated, curriculum-aligned lesson plans and export them cleanly.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `lessonloop`, preview at `/`)
- **API framework**: Express 5 (artifact: `api-server`, served at `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Cookie-based sessions (HMAC-signed, no external library)

## Features

- **Auth**: Register/login with email + password, session persists via signed cookie
- **Dashboard**: Stats overview (total/draft/complete/archived), recent lessons, lessons by subject, templates link
- **Lesson Editor**: Full guided form with all sections (objectives, materials, lesson sequence, assessment, curriculum alignment, differentiation, reflection). Autosaves every 800ms.
- **Lesson Archive**: Searchable/filterable list with status badges, duplicate/archive/delete actions
- **Templates**: 4 built-in lesson templates (Direct Instruction, Inquiry-Based, Literature Circle, PBL)
- **Preview & Export**: Print-formatted lesson view with PDF (via window.print) and DOCX placeholder

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- `users` — id, name, email, passwordHash, timestamps
- `lessons` — id, userId (FK), all lesson fields, status (draft/complete/archived), timestamps
- `templates` — id, name, description, subject, gradeLevel, isBuiltIn, lesson field defaults, createdAt

## OpenAPI / Codegen

Generated files live in `lib/api-client-react/src/generated/`. Do not edit them manually.
After spec changes: `pnpm --filter @workspace/api-spec run codegen`
