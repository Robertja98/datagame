# DataGame

A Phaser 3 + TypeScript + Vite browser game prototype that pairs Grade 12 Data Management questions with two play styles: an arcade crossover mode inspired by Frogger, Galaga, and Centipede, and a quest mode pivoting toward Intellivision-style dungeon exploration.

## Current Prototype

- Arcade mode: cross enemy lanes, dodge hazards, and reach the correct answer gate.
- Quest mode: lead a three-hero expedition from the cabin into a wilderness map, descend into mountain mazes, recover relics, and bring the Crown of Kings home.
- Solve Grade 12 Data Management questions to progress, restore HP, and earn resources.
- Built with code-generated shapes, so no art assets are required yet.

Quest-mode narrative and UI guidance is tracked in `CLOUDY_MOUNTAIN_REFERENCE.md`.

## Stack

- Phaser 3
- TypeScript
- Vite
- Express backend for question tracking
- CSV storage behind a replaceable server module

## Getting Started

Node.js is required to run this project locally.

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local Vite URL in your browser.

The development command starts both the frontend and the backend tracker. Question stats are written to `server/data/question-stats.csv` through the abstraction in `server/storage/QuestionStatsStore.js`, so moving to a database later only requires a new backend store implementation.

## Storage Modes

- Default CSV mode: `npm run dev`
- SQLite mode: `npm run dev:sqlite`
- Admin review page: open `/admin.html` on the Vite dev server
- Dungeon master page: open `/dungeon-master.html` on the Vite dev server

The admin review page can now:

- unflag a question
- reset counts for one question
- reset counts for all questions while keeping the question definitions
- generate new draft questions across multiple difficulty levels for review
- persist generated drafts between refreshes in `server/data/generated-question-drafts.json`
- approve selected drafts into the live custom question bank stored in `server/data/custom-questions.json`
- reject drafts from the queue
- export the current draft queue as JSON or CSV

The dungeon master page can now:

- tune maze columns, rows, and optional door density
- set the minimum and maximum gates or seals required per chapter
- control chest count and monster room population
- scale monster HP, damage, speed, and hunter-room pressure
- choose whether gate progression is automatic or requires manual gate marking

Approved custom questions are loaded into gameplay on startup, then synced into the same tracker backend as the built-in question bank.

The generated and built-in banks now include harder Grade 12 Data Management prompts such as z-scores, solving for x from a z-score, standard deviation, percentile interpretation, and longer word-problem style questions.

The backend now supports two store implementations behind the same API contract:

- `csv` using `server/data/question-stats.csv`
- `sqlite` using `server/data/question-stats.sqlite`

Store selection is controlled by `DATA_GAME_STATS_STORE`. The included `dev:sqlite` and `server:sqlite` scripts use Node's `--env-file` support with `.env.sqlite`, so create that file with:

`DATA_GAME_STATS_STORE=sqlite`

## Next Build Steps

- Deepen the quest mode with richer dungeon generation, item progression, and boss encounters.
- Expand the Grade 12 Data Management question bank.
- Add sound, scoring persistence, and polish.
