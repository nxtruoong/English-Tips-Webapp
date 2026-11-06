# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Implemented: React, TypeScript, Vite, ordinary CSS, reusable components, and self-hosted Be Vietnam Pro fonts. Local attempts, drafts, and recordings use IndexedDB. The production build is static; hosting provider remains undecided. See `README.md` for run and verification commands.

## Users

Primarily Vietnamese university students in technology-related majors; the owner reports the audience is mostly male. Students have basic English and are preparing for IELTS Academic. Initial positioning is approximately IELTS 4.0–5.5 toward 6.0; these values describe the intended audience, not an assessed starting level or promised outcome.

## Product Purpose

Turn supplied guides into repeatable 20–30 minute study sessions: learn one technique, attempt an activity, review evidence or a model, and retry a weakness.

## Positioning

A focused study workspace built around the supplied curriculum, with actionable review and preserved work. The MVP is independent practice material, not an official IELTS product or a certified band assessment.

## Operating Context

Students study on mobile and desktop. Vietnamese navigation and explanations support English exercises and model answers. Guest access saves work on the current browser and device. Provide export and deletion; local storage may be cleared and does not provide cross-device sync.

## Capabilities and Constraints

- Four skills: Listening, Speaking, Reading, and Writing.
- A source-backed lesson library has 17 modules: four Listening parts, three Speaking parts, two Writing tasks, and eight Reading question-type modules.
- Each module exposes theory, exercise/planning guide, small exercises, full exercises, and answer review. Source tables, figures, and audio remain available. “Full exercise” follows the source terminology and does not imply a complete mock test.
- Lesson stages, self-marked completion, per-exercise answers, and notes save locally and enter backups. Most imported exercises use an answer notebook and the original key; six curated workspaces provide the existing structured practice controls. Do not imply that all imported tasks auto-grade.
- Automatically mark objective questions using checked, question-specific rules.
- Speaking supports preparation, recording, playback, download, deletion, and guided self-review.
- Writing supports planning, autosaved drafts, word counts, revisions, and model comparison.
- Use existing short Reading drills first. The owner will add deeper exercise sets later.
- Preserve unfinished work, saved mistakes, and attempts.
- Reveal answers and models after an attempt or explicit request.
- Defer accounts, payments, social features, AI conversation, automated band scoring, complex adaptive learning, and university eligibility checking.
- Preserve original source files during conversion. Check provenance and content accuracy before publication.

## Brand Commitments

The owner rejected the campus-journal aesthetic. The replacement is a practical technical field-manual interface: graphite navigation, cool white workspaces, cobalt actions, clear sans-serif typography, direct interface copy, and useful study information. Avoid botanical decoration, literary styling, motivational slogans, and decorative code. Audience relevance comes through task clarity, not gender stereotypes. See `DESIGN.md` for implementation tokens. Hiên remains a provisional working name.

## Evidence on Hand

Eight DOCX files, 76 MP3 files, and one eight-page PDF in the original skill and research directories. See `docs/content-audit.md` for findings and verification limits. Research documents are supplied evidence, not independently validated product claims.

## Product Principles

1. Make the next useful study action obvious.
2. Connect review to evidence and a concrete retry.
3. Preserve student work through refreshes and navigation.
4. Keep learning content separate from presentation.
5. Show only progress and assessment the app can substantiate.

## Accessibility & Inclusion

Support keyboard operation, visible focus, readable typography, responsive layouts, and reduced motion. Explain recording permissions and storage failures. Provide transcripts for checked Listening content, with deliberate reveal during practice.

## Success and Open Decisions

Pilot with 5–8 students. Observe whether students finish an activity, use feedback, retry, and return. Do not invent numerical success thresholds before collecting a baseline.

Open: product name, hosting provider, broader browser support matrix, content publication permissions, verified audio alignment, and future sync requirements. Chromium desktop/mobile flows have been tested; this does not establish cross-browser coverage.
