# Hiên — English study MVP

A local-first English practice app for Vietnamese university students. React, TypeScript, Vite, ordinary CSS, and IndexedDB. “Hiên” is a provisional working name.

The current theme targets students in technology-related majors: graphite navigation, cool white study panels, cobalt actions, sans-serif typography, direct labels, and real progress information. The previous campus-journal theme has been replaced. Learning data, existing attempts, and backup formats are unchanged.

## Run

Use Node.js 22.12+ (Node 24 was used here).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Use HTTPS when deploying; microphone access requires a secure context (localhost is supported for development).

On Windows, double-click `start.cmd` to start Vite and open the app. Keep its terminal open while using the app. The server must be restarted after closing it or restarting the computer.

VS Code's **Go Live** is configured in `.vscode/settings.json` to serve the built app from `dist/` on port 5500. Run `npm run build`, stop any existing Live Server, then click **Go Live** and open `http://127.0.0.1:5500/`. Rebuild after source changes; Live Server does not compile React/TypeScript. Use Vite on port 5173 for development with automatic source updates.

```sh
npm run build
npm run preview
npm test
npm run lint
npm run format        # rewrite files with Prettier; CI runs format:check
npx playwright install chromium
npx playwright test
```

Playwright starts the dev server on port 5173 when nothing is listening there and otherwise reuses the running one. If a dev server was started before `vite.config.ts` changed, restart it before running end-to-end tests. In VS Code, F5 runs the **Run app (Vite dev)** launch configuration.

GitHub Actions (`.github/workflows/ci.yml`) runs the format check, lint, build, unit tests and Playwright on every push to `main` and every pull request.

Production output is `dist/`; publish that directory to a static host. The build uses a relative base, so it works at the site root or under a sub-path such as GitHub Pages. Reference public files through `asset()` in `src/asset.ts`, never as hard-coded `/media/...` URLs. No public deployment has been made.

## Lesson library and interactive practice

Open **Bài học** in the navigation, or `http://127.0.0.1:5173/#courses`. The library imports all seven instructional skill guides into 17 modules: four Listening parts, three Speaking parts, two Writing tasks, and eight Reading question types.

Every module exposes **Theory → Exercise/planning guide → Small exercises → Full exercises → Answer review**. Source text, tables, 54 figures, and all 76 audio files remain available. Sections expand individually; source model essays remain collapsed until opened. Lesson content loads on demand. Each stage and exercise can retain notes or answers, and stage completion is explicitly self-marked.

Most imported exercises use a saved answer notebook and the source answer key. They do not all have per-question automatic marking. The following six curated workspaces retain their structured controls:

- Listening Part 1: ten-question Westlake form, supplied audio, answer explanations, transcript reveal, saved mistakes, and retries.
- Speaking Part 1: four Study questions, optional preparation timer, local microphone recording, playback, download, and self-review.
- Reading: museum and botanical-garden True/False/Not Given drills with evidence-based review.
- Writing Task 1: original bakery chart, planning, draft, revision snapshots, and model comparison.
- Writing Task 2: food-waste essay, planning, draft, revision snapshots, and model comparison.

The app labels imported practice content and verification limits. It does not provide official IELTS scores. Reading includes the available source exercises across eight question types; longer and more varied Reading practice will be added later.

## Saved work

Attempts, draft responses, saved questions, lesson-stage progress, lesson answers/notes, and recording blobs live in IndexedDB in the current browser profile and origin. They survive ordinary refreshes but are not cloud-synced. Export backups from the device-data control; backups include recordings and lesson progress. Older backups without lesson fields still import. Import validates version and structure, then replaces local study data after confirmation. File import is limited to 100 MB. Clearing site storage removes local work.

Browser permission denial, missing audio, failed storage, empty history, and empty searches have recovery states. The app is local-first, not a full offline PWA: assets still require the app server or deployed site.

## Content workflow

Keep original DOCX, PDF, and MP3 files unchanged. Curated definitions live in `src/content/activities.ts`. Source excerpts and asset extraction are reproducible:

```sh
python scripts/import_sources.py
npm run curriculum:import
```

The first standard-library script extracts the six curated workspaces' excerpts and assets and inventories all eight DOCX files. `scripts/import_curriculum.py` imports the seven instructional guides into stages, writes the lesson index, creates one JSON payload per lesson under `public/curriculum/`, and copies original figures/audio to `public/media/curriculum/`. Source-media origins and source-byte hashes are recorded in `src/content/curriculum-assets.json`. Reimport recreates derived figures; run provenance embedding/checks again before release.

Importing does not approve material for publication or infer additional accepted answers. Review `docs/content-audit.md` before expanding structured grading. Increment activity versions when changing graded answers, prompts, or source evidence so old attempts retain their original meaning.

## Planning and design

- `PRODUCT.md`: approved audience, product constraints, and scope.
- `.scratch/english-study-mvp/spec.md`: original implementation milestones and acceptance criteria.
- `docs/content-audit.md`: source alignment, gaps, and release prerequisites.
- `docs/assets.md`: image generation prompts and original media origins.
- `docs/agents/`: local issue tracker, triage vocabulary, and domain conventions.

## Remaining release work

Listen-check imported audio against transcripts and keys. Review supplied-media publication permissions and chart labels/values, select the product name and host, and run the planned student pilot. Source import and learning-flow checks cover all 17 module structures; detailed correctness checks and structured grading remain limited to the curated exercises. Further exercises can be converted from notebook/self-review to dedicated interactive controls in reviewed batches.
