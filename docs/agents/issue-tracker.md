# Issue tracker: Local Markdown

Issues and feature specifications live in `.scratch/`.

- One feature per directory: `.scratch/<feature-slug>/`.
- Specification: `.scratch/<feature-slug>/spec.md`.
- Individual tickets: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`. Do not combine tickets in one file.
- Record triage state in a `Status:` line near the top, using `triage-labels.md`.
- Append discussion under `## Comments`.

Publishing to the issue tracker means creating or updating the relevant local Markdown file. Fetching a ticket means reading the referenced file; ticket numbers are scoped to their feature directory.

## Wayfinding

For a wayfinding effort, use `.scratch/<effort>/map.md` for notes, decisions, and unresolved questions. Child tickets use the numbered issue paths above, a `Type:` line (`research`, `prototype`, `grilling`, or `task`), and a separate `Work state:` line (`open`, `claimed`, or `resolved`). Keep `Status:` for triage vocabulary.

Record dependencies as `Blocked by: NN, NN`. Claim the first open, unblocked child by number before working. On resolution, append `## Answer`, set its work state to resolved, and add an answer summary and link to the map.
