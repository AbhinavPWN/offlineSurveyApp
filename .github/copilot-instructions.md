# AI Coding Agent Instructions for Offline Survey App

## Architecture Overview

This is an offline-first React Native survey app built with Expo, targeting Android for NGO household surveys in Nepal. The app uses SQLite for local data storage with background sync to a remote API.

**Key Components:**

- **Data Layer**: SQLite with migrations (`src/db/`) and repository pattern (`src/repositories/`)
- **Business Logic**: Use cases in `src/usecases/` handle sync, validation, and operations
- **UI Layer**: Expo Router file-based navigation (`app/`), screens in `src/screens/`
- **Auth**: PIN-based unlock with session management (`src/auth/`)
- **Styling**: NativeWind (Tailwind CSS for React Native)

## Core Patterns

- **Offline-First Design**: All data stored locally in SQLite, sync operations are explicit use cases
- **Clean Architecture**: Models → Repositories → Use Cases → Services → UI
- **Dependency Injection**: Manual singletons exported from `src/di/container.ts`
- **Bilingual UI**: English/Nepali labels in `src/constants/labels.ts`
- **Sync States**: `DRAFT` (local only), `SYNCED`, `PENDING`, `FAILED` with actions `INSERT`/`UPDATE`
- **Local IDs**: UUID v4 for client-generated IDs, server IDs stored separately

## Development Workflow

- **Start App**: `npm start` (Expo dev server)
- **Android Build**: `npm run android` (Expo Run)
- **Database**: Auto-migrates on app launch via `src/db/migrate.ts`
- **Data Seeding**: Run `npx tsx scripts/generateAddressMaster.ts` to generate address constants from Excel files
- **Logging**: Use `AppLogger` for structured logging with levels

## Code Conventions

- **Imports**: Use `@/` path alias for `src/` directory
- **Models**: Interfaces in `src/models/`, domain models in `src/domain/models/`
- **Repositories**: Implement interfaces, SQLite implementations prefix with `SQLite`
- **Use Cases**: Constructor-injected dependencies, async methods for I/O
- **Screens**: Functional components receiving repos/use cases as props
- **Styling**: Class names with NativeWind, responsive design considerations
- **Error Handling**: Try/catch in use cases, AppErrorBoundary for UI crashes

## Common Tasks

- **Add New Screen**: Create in `app/(app)/` for authenticated routes, `app/(auth)/` for auth
- **Add Model**: Define interface in `src/models/`, create repository interface/impl
- **Add Sync Logic**: Create use case in `src/usecases/`, wire in `src/di/container.ts`
- **Update DB Schema**: Add migration in `src/db/migrations/`, increment version
- **Add API Endpoint**: Implement in service class (`src/services/`), update use case

## Key Files to Reference

- `src/di/container.ts`: All dependency wiring
- `src/db/migrate.ts`: Database setup and migrations
- `src/models/household.model.ts`: Core data structures
- `src/usecases/household/SyncHouseholdUseCase.ts`: Sync pattern example
- `src/constants/labels.ts`: UI text constants
- `app/_layout.tsx`: App initialization and providers</content>
  <parameter name="filePath">c:\nirdhan\survey-app\.github\copilot-instructions.md
