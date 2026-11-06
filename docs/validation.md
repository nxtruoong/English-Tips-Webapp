# Starter validation

Validated 29 October 2026 on Windows, Node 24, and headless Chromium. The development server runs at `http://127.0.0.1:5173/`.

## Automated checks

- `npm run build`: TypeScript and Vite production build passed.
- `npm test`: six unit checks passed for question-specific answer evaluation, backup validation, and content identity/review requirements.
- `npx playwright test`: eight browser flows passed. See `e2e/study.e2e.ts`.
- `npm audit`: zero known dependency vulnerabilities reported at validation time.
- Impeccable mechanical detector: ran once against UI sources, returned no findings.

Browser flows cover desktop 1440 and mobile 390 screenshots, horizontal overflow, draft recovery, Listening marking and retry, mobile Reading answer retention, Writing revisions and model-reveal tracking, microphone denial and successful recording, recording persistence and backup import/export, keyboard skip navigation, empty search recovery, and visible storage/audio failure recovery.

Audio capture tests use a synthetic browser microphone; they verify the recording and persistence path, not a physical device's quality. Chromium success does not certify other browsers. MP3 metadata checks and runtime loading do not establish that speech aligns with all questions.

## Visual review

Required captures: `.impeccable/review/desktop.png`, `mobile.png`, `workspace-1440.png`, and `workspace-390.png`.

Independent reviewer opened all four captures, requested heading eyebrow cleanup and active-state accessibility for mobile view buttons, and then scored both fixes resolved. Final disposition: **ship for private pilot**. That verdict concerns the reviewed starter interface; public release still requires content verification.

## Release prerequisites

Listen-check the audio against supplied scripts and keys. Review chart labels and approximate values. Confirm publication permissions for supplied assets. Extend Reading and import the remaining material in reviewed batches. Run the planned student pilot and choose a final product name and host.

## Theme replacement — 30 October 2026

Replaced the campus-journal visual world for the owner's clarified tech-major audience. The current theme uses graphite navigation, white workspaces, cobalt actions, and Be Vietnam Pro. Decorative generated assets were archived outside `public/`. Lesson names and interface headings were made direct; learning prompts, answers, activity IDs, content versions, storage, recording, and backup behavior were preserved.

Six unit checks and all eight Playwright flows passed after replacement, including desktop/mobile screenshots and no horizontal overflow. TypeScript and the production build passed. Dependency installation reported zero known vulnerabilities. The mechanical detector ran once and flagged intentional color/type differences against the old design documentation; the replacement design records now describe the new system.

An independent finish reviewer opened all four current screenshots, found no blocking visual or behavioral issues in scope, and returned **ship** for the theme replacement. This review does not certify source content or public publication readiness.

## Five-stage curriculum restoration — 30 October 2026

Added 17 modules with nonempty theory, guide, small exercise, full exercise, and review stages. Imported original source tables, 54 figures, and 76 audio files. Media copies matched source hashes before source-origin metadata embedding; MP3 copies remain byte-identical. Original documents remain untouched. Units fetch their JSON on demand; the application JS build remains approximately 290 kB before gzip.

Validation passed: 12 unit checks and 13 browser flows. New checks cover module/stage coverage, source section separation, graphics/audio groups, closed model sections, older-backup compatibility, lesson-note/stage backup round-trip, progress recovery after refresh, and lesson-download retry. Existing scoring, recording, and draft-recovery flows continue passing. After adding mobile source disclosures, all five curriculum browser flows passed again. A deterministic recapture removed transient focus from screenshots; the desktop/mobile capture check and final production build passed.

The independent finish reviewer opened four lesson screenshots and returned **ship**, finding the missing sequence restored and no required fixes. Its optional mobile-provenance disclosure recommendation was implemented. The mechanical detector ran once for this extension and returned advisory color/type documentation differences; there were no hard findings. Source content accuracy, universal per-question grading, and official test equivalence are not established by these checks.
