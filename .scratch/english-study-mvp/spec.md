# English study MVP

Status: ready-for-agent
Scope: Approved planning baseline; implementation authorized by the subsequent request to continue. A six-activity starter now exists; see implementation status below.

## Audience and outcome

See `../../PRODUCT.md` for durable product decisions. Help Vietnamese university students with basic English complete a useful practice-and-review session in 20–30 minutes.

The core loop is: choose a skill, learn one technique, attempt an activity, review evidence or a model, and retry a weakness. Completion and objective accuracy are supported metrics. Self-review does not produce an IELTS band.

## Navigation and screens

Use three primary destinations: Today, Practice, and Review.

| Screen | Main task | Required behavior |
| --- | --- | --- |
| Today | Resume or start a session | Show unfinished work first, a simple next activity, and recent progress. |
| Practice | Find suitable material | Browse four skills; filter by topic, part, and duration. Show honest availability. |
| Lesson | Learn one technique | Present concise explanation and examples followed by a relevant activity. |
| Workspace | Complete practice | Use skill-specific controls, preserve inputs, and show save status. |
| Review | Understand and retry | Show checked answers, evidence, explanations, models, and one next action. |
| Progress within Today | Inspect study history | Show attempts, saved mistakes, and drafts without unsupported proficiency claims. |

## Skill behavior

- Listening: player, questions, explicit submission, marking, explanations, transcript reveal, and retry. Map each activity to checked audio segments. Label a ten-question part as part practice, not a complete four-part mock test.
- Speaking: prompts, optional preparation timer, recording, playback, download, deletion, model reveal, and self-review checklist. Recording failure must not prevent prompt practice.
- Writing: source graphic or essay prompt, planning area, autosaved draft, word count, revisions, model comparison, and self-review. Support Task 1 and Task 2 as distinct activity types.
- Reading: existing short passages and drills, objective marking where appropriate, evidence-based review, and later content expansion without a UI rewrite.

## Technical structure

Use React, TypeScript, Vite, ordinary CSS, and reusable components. Keep content, answer evaluation, attempt persistence, and workspace presentation separate. Use validated, versioned content records with stable asset references. IndexedDB stores attempts, drafts, and recording blobs locally. Provide export, import validation, deletion, and migration handling.

Use a static build. Hosting provider remains open. Do not load all audio into memory at startup. Request recording permission only when the student chooses to record. Detect supported recording formats. Handle unavailable storage and quota failures without falsely reporting that work was saved.

Local-first means saved progress on the current device; it does not promise offline asset availability. Full offline caching and cross-device synchronization are outside the MVP.

## UI brief

The study workspace operates as a task-focused application. On 30 October 2026 the owner rejected the original campus-journal theme and clarified a primarily tech-major student audience. The replacement uses graphite navigation, cool white work surfaces, cobalt actions, sans-serif text, and practical interface copy. Avoid botanical decoration, literary styling, motivational slogans, decorative code, and demographic stereotypes.

Desktop pairs material with answers or drafts. Mobile provides clear source/workspace tabs that preserve input and scroll position. Use persistent, unobtrusive save feedback, visible focus, large touch targets, accessible labels, and reduced-motion behavior. Avoid decorative motion during timed practice.

The current code-led visual selection is a technical field-manual interface with a next-task area, three-step practice sequence, flat skill index, and actual study counts. See `../../DESIGN.md` for durable tokens and `../../.impeccable/surfaces/study.md` for surface strategy. Earlier generated journal mockups are historical references, not current visual authority.

## Milestones

### 1. Content foundation

Create content inventory and schema. Convert one representative lesson per skill. Check source attribution, images, answer rules, audio mappings, and timestamps. Separate objective questions from open responses. See `../../docs/content-audit.md`.

Exit: fixtures validate, every published activity has its required assets and review material, and unresolved content remains draft.

### 2. First complete flow

Build the app shell and one Listening activity through selection, attempt, submission, explanation, saved mistake, and retry. Persist work through refresh. Use explicit answer normalization policies.

Exit: a student can complete the entire loop and resume an interrupted attempt.

### 3. Four-skill coverage

Add speaking recording and self-review; Writing Task 1 and Task 2 drafts and model comparison; existing Reading drills. Cover each supported interaction type with checked content before batch import.

Exit: all four skills have usable practice and review, including recovery states.

### 4. Retention and data control

Add resume, attempt history, saved mistakes, export/import, and deletion. Suggest next practice through simple rules: unfinished activity, saved mistake, then unattempted relevant activity. Do not imply assessed proficiency or sophisticated adaptation.

Exit: history and retry remain coherent across content versions and storage migrations.

### 5. Pilot and release readiness

Pilot with 5–8 students. Observe activity completion, feedback use, retry behavior, and return visits. Record confusing moments and content defects. Set quantitative targets only after establishing a baseline.

Check mobile and desktop layouts, keyboard access, save recovery, audio errors, microphone denial, unsupported recording formats, and storage failures. Import remaining checked content in batches.

## Acceptance criteria

- Refresh restores unfinished answers and writing drafts.
- Existing work survives switching between mobile source and answer views.
- Audio failure and microphone denial provide clear recovery actions.
- Objective marking follows verified alternatives and word limits.
- Models and transcripts remain deliberately revealable.
- Keyboard users can attempt, submit, review, and retry.
- Recording and draft export/deletion work; failed persistence is visible.
- Content changes do not silently rewrite past attempts.
- UI remains usable with long prompts, missing optional media, empty history, and no matching filters.
- No unsupported band prediction, official affiliation, or university eligibility claim appears.

Test answer evaluation against meaningful edge cases and persistence against refresh/migration failures. Exercise real user flows for submission/review, draft recovery, and recording permission failure. Avoid tests that merely mirror component markup.

## Deferred

Accounts, cloud sync, payments, social features, AI conversation, automated essay/speaking band scores, complex adaptive learning, full offline caching, full mock-test orchestration, an admin CMS, and university eligibility checking.

## Open decisions

Product name, hosting provider, final visual concept, browser support matrix, publication rights, verified audio alignment, and future account/sync needs. These do not prevent completing the planning baseline.

## Reference documentation

- Vite: https://vite.dev/guide/
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

## Comments

The owner approved the recommended planning package in chat and then requested continued implementation. Original learning sources remain unchanged.

## Implementation status — 29 October 2026

Implemented a local starter with six activities across all four skills: Listening Westlake form, Speaking Study, two Reading drills, Writing Task 1 bakery chart, and Writing Task 2 food waste. Objective review, saved mistakes, retries, microphone recording, playback, draft recovery, revision snapshots, local history, backup import/export including recordings, and deletion are available. Content definitions and source extraction are separate from UI.

Validation: six domain/import unit checks, eight Chromium Playwright flows, TypeScript and production build, and npm audit passed. Browser flows cover desktop/mobile renders, no horizontal overflow, Listening marking and retries, mobile answer retention, Writing draft recovery and revisions, recording success and denial, recording backup round-trip, keyboard skip navigation, search recovery, storage failure, and audio failure. This is not a cross-browser certification.

Independent design review disposition: ship for private pilot. The reviewer scored its two required fixes resolved: heading eyebrow cleanup and mobile view selected-state semantics. Four refreshed screenshots were valid. The mechanical design detector ran once and returned no findings.

Remaining: verify audio by listening against scripts and keys; check publication permissions and source graphics; import the remaining source bank; expand Reading; select final name and hosting; run the 5–8 student pilot. No public deployment has been made. Do not interpret this starter as a fully verified or complete IELTS curriculum.

## Curriculum correction — 30 October 2026

The owner pointed out that the initial six-workspace implementation omitted most of the planned learning progression. Added a Bài học library with 17 source-backed modules, each exposing theory, exercise/planning guide, small exercises, full exercises, and answer review. This imports all seven instructional guides while keeping original files unchanged. The research document remains contextual evidence rather than learner-facing course content.

Source tables, 54 figures, and 76 audio files are available. Student notes, per-exercise answers, current stage, and self-marked completion save locally and enter backups. Old backups and existing exercise attempts remain compatible. Most source tasks use an answer notebook and original keys; the six curated workspaces retain their structured controls. Universal automatic grading was not added.

Validation: 12 unit checks, 13 browser flows, production build, source-media hash checks, and independent scoped UI review passed. The reviewer returned ship; its optional mobile-provenance suggestion was implemented and checked. Remaining work is source/audio correctness verification, publication permissions, richer Reading practice, further conversion to structured interactive questions, hosting, naming, and the student pilot.
