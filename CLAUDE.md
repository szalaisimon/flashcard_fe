# CLAUDE.md

This file provides guidance to AI coding assistants working in this repository.

## Project

Angular 20.3 / TypeScript 5.9 single-page flashcard study app. Components are standalone and use signals for UI state, RxJS for asynchronous work, and Angular reactive forms for data entry. The Spring Boot API lives in the sibling `flashcard_be` repository. See [flashcard_be](https://github.com/szalaisimon/flashcard_be).

## Local development and checks

Use a Node.js version supported by the installed Angular packages and npm. The lockfile is `package-lock.json`.

```bash
npm ci
npm start                              # http://localhost:4200
npm run build                          # default optimized build
npm run build -- --configuration development
npm run watch                          # rebuild in development mode
npm test                               # Karma/Jasmine in a browser
npm test -- --watch=false --browsers=ChromeHeadless
```

Headless tests need an installed Chrome/Chromium browser; set `CHROME_BIN` if it is not found automatically. Existing specs mainly check component/service creation and the root app. There is no configured end-to-end target or lint script.

`src/environments/environment.ts` and `environment.prod.ts` both point `apiUrl` to `http://localhost:8080`. `angular.json` selects the latter for the production build; it also configures assets, styles, and bundle budgets. Both environment files are local source files. Their `version` field is displayed in the header. The build output is under `dist/flashcard-client`.

The optimized build inlines the Roboto stylesheet linked from `src/index.html` and requires network access to Google Fonts.

Start the backend and its PostgreSQL/Redis dependencies to use the app. The backend permits credentialed requests from `http://localhost:4200`; keep frontend and backend hostnames consistent for cookies.

## Structure and routes

- `src/main.ts` bootstraps `App` using `app.config.ts`, which provides the router, HTTP client with `authInterceptor`, and zone-based change detection.
- `app.ts` initializes authentication and manages the shared header, navigation, footer, and router outlet. `app.routes.ts` defines all routes, including the wildcard not-found page.
- Public routes: `/` (home), `/login`, and `/register`.
- Routes protected by `AuthGuard`: `/deck`, `/deck/:id`, `/deckattempt/:id`, `/history`, and `/history/:id`.
- `components/deck` and `components/flashcard` implement deck/card CRUD; `components/deck-attempt` implements practice; `components/history` implements summaries and detailed review.
- `components/shared` contains navigation, modal, pagination, and not-found components. Assets live in `public` and `src/assets`; global CSS is in `src/styles.css` and component styles are plain CSS.
- `services` contains HTTP access; `model` defines API interfaces. Service URLs derive from `environment.apiUrl` and use `/api/v1/user`, `/api/v1/deck`, and `/api/v1/deckattempt`.

## Authentication and errors

- Authentication uses backend-managed `HttpOnly` cookies. `AuthService` creates an HTTP client from `HttpBackend` to bypass interceptors and explicitly sends `withCredentials: true` on auth requests.
- `currentUserSig` has three states: `undefined` while unresolved, `null` when signed out, and a username string when signed in. `initialize()` calls `/user/me`, attempts refresh on 401, and shares concurrent initialization. Transient failures populate `initializationError` and leave authentication unresolved for retry.
- `refreshSession()` shares concurrent refresh requests. Login sets the current username; successful logout clears it. Authentication state is kept in memory and restored through the backend on page load.
- `authInterceptor` adds credentials only to requests under the configured API's `/api/` prefix. On 401 it refreshes and retries once; rejected sessions redirect to `/login` with `returnUrl` and `expired` parameters.
- `AuthGuard` waits for initialization before allowing navigation or returning a login redirect with `returnUrl`.
- Components display request errors using `utils/http-error.ts`. `errorMessage()` handles connectivity failures, session errors, conflicts, validation responses, and rate limiting, including the backend's `Retry-After` header. `utils/validators.ts` supplies the `nonBlank` form validator.

## Practice and API contracts

- Creating a practice session sends `{deckId}`. The backend may return an already active session; decks expose `activeAttemptId` for resuming it.
- `FullDeckAttempt` is the source of truth for practice progress. Its `fullCardAttemptDtos` contain immutable question/answer snapshots, positions, and nullable correctness. The component sorts by position and selects the first card with `correct === null`.
- `AttemptStatus` is `IN_PROGRESS`, `COMPLETED`, or `ABORTED`. Keep these values aligned with the backend; `attemptStatusLabel` provides display text.
- A rating sends `{flashCardId, correct}` and then reloads the full attempt. A 409 triggers a reload with a notice that another tab changed the session. If progress cannot be reloaded after a write, `reloadRequired` prevents further ratings until a successful reload.
- Aborting uses `POST /deckattempt/{id}/abort` after a confirmation dialog. Completed or aborted sessions show their saved results. Correct, incorrect, and unanswered counts are separate, and history uses snapshots even after cards or decks are edited or deleted.
- Pagination uses zero-based `page` and a `size` query parameter. `PaginatedResponse<T>` contains `data`, `currentPage`, `totalPages`, `totalItems`, `pageSize`, `hasNext`, and `hasPrevious`.

TypeScript and Angular template checks are strict. Keep API interface fields, status values, and error handling aligned with the backend DTOs. Follow the surrounding component naming and style rather than renaming files broadly.
