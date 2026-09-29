# Flashcard — Frontend

Web interface for a flashcard study app with user accounts, deck and card editing, resumable practice sessions, and saved practice history.

The app consists of two repositories:

| Repository | Purpose |
| --- | --- |
| [flashcard_fe](https://github.com/szalaisimon/flashcard_fe) | Angular user interface |
| [flashcard_be](https://github.com/szalaisimon/flashcard_be) | Spring Boot API, persistence, and authentication |

## Stack

Angular 20.3, TypeScript 5.9, standalone components, signals, RxJS, and reactive forms. Authentication uses backend-managed cookies, and saved practice progress is loaded from the API.

## Run locally

Requires Node.js supported by Angular 20.3 and npm. Node.js 22.12 or later in the 22.x line is supported by the locked Angular packages.

Start the [backend and its local dependencies](https://github.com/szalaisimon/flashcard_be#run-locally), then run:

```bash
git clone https://github.com/szalaisimon/flashcard_fe.git
cd flashcard_fe
npm ci
npm start
```

Open `http://localhost:4200`. Both `src/environments/environment.ts` and `environment.prod.ts` use `http://localhost:8080` as the API URL. Use `localhost` consistently for both applications so the backend's CORS and cookie settings match.

## Build and test

```bash
npm run build
npm run build -- --configuration development
npm test -- --watch=false --browsers=ChromeHeadless
```

Build output is written to `dist/flashcard-client`. The optimized build fetches the Roboto stylesheet from Google Fonts and requires network access. Headless tests use Karma/Jasmine and need Chrome or Chromium; set `CHROME_BIN` if the browser is not detected automatically.

## Features

- Registration, login, session restoration, and logout.
- Deck and flashcard creation, editing, and deletion.
- Resumable practice with card flipping, self-assessment, and an abort action.
- Practice history with saved questions and answers, status, and correct/incorrect/unanswered counts.

See [CLAUDE.md](CLAUDE.md) for routes, authentication flow, API contracts, and coding context.
