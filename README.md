# Hiên — English study MVP

A local-first English practice app for Vietnamese university students. React, TypeScript, Vite, ordinary CSS, and IndexedDB. “Hiên” is a provisional working name.

The current theme targets students in technology-related majors: deep violet navigation, white study panels, violet actions with gold highlights, sans-serif typography, direct labels, and real progress information. The previous campus-journal theme has been replaced. Learning data, existing attempts, and backup formats are unchanged.

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

### Deploying to Netlify or Vercel

The app uses hash routes (`#today`, `#tools`…), so no rewrite rules are needed. Both hosts serve HTTPS, which the microphone recorder requires.

- **Netlify, no build settings:** run `npm run build`, open https://app.netlify.com/drop and drag the `dist/` folder onto the page. Netlify returns a public `*.netlify.app` link. Drag a new build onto the same site to update it.
- **Netlify or Vercel from GitHub:** import the repository, set the build command to `npm run build`, the output/publish directory to `dist`, and Node.js to 22 or later. Each push to the chosen branch redeploys.
- **Vercel CLI:** run `npm run build`, then `npx vercel deploy dist --prod` and follow the login prompt.

Before a public link goes into slides, replace `FEEDBACK_FORM_URL` and review the release items below.

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

## Study habits and self-study tools

These features respond to the project's survey of 132 students (42.4% name low motivation as the main barrier, 70.5% self-study under 2 hours a week, 54.5% struggle to remember vocabulary, 43.9% hesitate to speak, 61.1% spend nothing on learning, 60.6% want a clear roadmap).

- **Start guide** (`#start`): a first-time visitor who opens the site without a destination and has no saved work is sent through three steps: how the app works, choose a level (directly or with the five-question self-check), then the first suggested lesson with a daily goal. It shows once per browser (finishing or skipping sets `hien.started` in localStorage) and stays reachable from the banner on Cẩm nang.
- **Streak and daily goal** (Tổng quan): a day counts as studied when a lesson step is marked done or a practice attempt is completed. The page shows the current and longest streak and a daily goal of 1–3 steps (about 20 minutes each, default 1; changed under Cài đặt & dữ liệu). Unmarking a step removes one from today's count. Days use Vietnam time. Logic: `src/streak.ts`.
- **Vocabulary flashcards** (`#cards`, Từ vựng): learners add a word, meaning and optional example, or use **Thêm từ vựng** inside a lesson, where selected text prefills the word. Review uses levels 1–5 with 1, 3, 7, 14 and 30 day gaps: remembered moves up one level, forgotten returns to level 1 (due tomorrow). New cards are due the day they are added. Tổng quan shows how many cards are due. Five sample decks (everyday speaking, TOEIC office, academic words, describing charts, IT terms; 66 cards with original example sentences) can be copied into the learner's cards in one click; words already present are skipped, and decks whose main level matches the learner's come first. Logic: `src/flashcards.ts`; decks: `src/content/sampleDecks.ts`.
- **Level suggestions**: on first visit Tổng quan asks for Mới bắt đầu / Trung bình / Khá, each described by what learners at that level can usually do. Unsure learners can answer five yes/no self-check questions (0–1 yes: beginner, 2–3: intermediate, 4–5: advanced), see the recommended level with a preview of what changes, and confirm or pick another. **Để sau** collapses the prompt to one line. The choice can be changed under Cài đặt & dữ liệu (`#data`), which also offers the self-check. It reorders the suggested lessons, picks the hero's next lesson and shows three level-specific tips. Nothing is locked. Content: `src/content/levels.ts`.
- **Free tools** (`#tools`, Công cụ): 11 free tools grouped by task with a one-line use, related skills, a skill filter and links that open in a new tab, plus free places to practise speaking (Discord exchange groups, language clubs, study groups). Content: `src/content/tools.ts`; URLs and icons are shared with the Cẩm nang resource list in `src/content/guide.ts`.
- **UIT outcome note** (Tổng quan): UIT standard programmes (2024 intake onward) require TOEIC Listening–Reading ≥ 450 and Speaking–Writing ≥ 185. The note reads these values from `src/content/outcomes.ts` and explains that the IELTS-format lessons still train the four underlying skills.
- **Feedback**: every page ends with a **Góp ý** button. Set the team's Google Form link in `FEEDBACK_FORM_URL` in `src/config.ts` (marked TODO). While it is still the placeholder, the button shows "form sắp mở" instead of linking to a dead page.

## Saved work

Attempts, draft responses, saved questions, lesson-stage progress, lesson answers/notes, recording blobs, study days, the daily goal, flashcards and the chosen level live in IndexedDB in the current browser profile and origin. They survive ordinary refreshes but are not cloud-synced. Export backups from Cài đặt & dữ liệu; backups include every one of these fields. The backup format stays at schema 1: fields added later are optional, so older backups without lessons, study days, cards or a level still import with empty defaults. Import validates version and structure, then replaces local study data after confirmation. File import is limited to 100 MB. Clearing site storage removes local work.

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
