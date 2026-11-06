# Learning content audit

Inspected 29 October 2026. This audit concerns the supplied local files, not independent verification of linked research or institutional policy.

## Inventory and verification

| Area | Sources | Findings |
| --- | --- | --- |
| Listening | 1 DOCX, 8 MP3 | Four parts, small exercises, full practice, keys, explanations, and full-practice scripts. All eight explicit audio filenames resolve. Nine embedded media files. |
| Speaking | 3 DOCX, 68 MP3 | Parts 1–3 contain 29 small exercises, 30 planning prompts, and 36 full practice sets. Audio filenames cover those groups; each part combines P1–P10 in one recording. |
| Writing | 2 DOCX | Task 1 contains 27 full report tasks and 45 embedded media files. Task 2 includes theory, exercises, planning, essays, and keys. |
| Reading | 1 DOCX | Short passages and drills, keys, and explanations across the listed question families. Longer and more varied practice remains limited. |
| Research | 1 DOCX, 1 PDF | Vietnamese methods report and an eight-page compilation of university language requirements and research references. |

DOCX text and package media counts were inspected programmatically. PDF text was extracted. All 76 MP3 files passed ffprobe metadata checks; reported durations range from 15.312 to 251.496 seconds.

These checks do not establish audio intelligibility, full decode integrity, speaker accuracy, answer alignment, image legibility, or factual correctness. Embedded media counts do not imply unique usable exercise illustrations. No runnable application, Git repository, or package configuration existed at inspection.

## Alignment

The guides broadly share a learning progression: theory, small exercises, planning, full practice, and review. This supports a shared lesson structure with skill-specific workspaces. Speaking filenames align structurally with exercise IDs, but documents do not supply explicit MP3 links. Reading already has exercises; the pending addition concerns depth and volume.

## Required remediation

| Priority | Finding | Action |
| --- | --- | --- |
| Before importing | Content exists as documents rather than app records. | Assign stable IDs and structured instructions, questions, answer rules, models, and source pointers. |
| Before publishing audio activities | Filenames alone do not prove spoken alignment. | Listen against prompts, keys, and scripts; record timestamps and verified status. |
| Before automatic marking | Alternatives and normalization are not encoded. | Specify accepted answers, word limits, case handling, spacing, punctuation, and multi-select policy per item. |
| Before Listening publication | Some instructions assert mandatory capitalization. | Verify marking guidance against current official sources before encoding rules. |
| Before publication | Listening uses Cambridge claims while other guides describe original independent materials. | Confirm provenance and permissions; standardize attribution without unsupported official claims. |
| Before Task 1 publication | Source notes acknowledge approximate values and inconsistent totals. | Compare each graphic, prompt, and model; correct derived records or exclude unresolved activities. |
| Reading expansion | Diagram exercise is a table; notes/table completion lacks equivalent dedicated practice. | Add an actual labeled diagram and dedicated examples when extending the bank. |
| Research cleanup | Methods report shifts from five classification axes to seven. | Resolve terminology and identify supporting survey data or label proposals as hypotheses. |
| Research cleanup | Speech-recognition description appears under Text-to-Speech. | Correct the distinction and any derived feature claims. |
| Future university feature | Requirements depend on school, program, and cohort. | Reverify primary sources and effective dates before implementation; exclude eligibility checking from MVP. |

## Content record proposal

Each activity should carry an ID, version, skill, part, topic, technique, estimated duration, reviewed difficulty tag, instructions, source pointer, publication status, and related activity IDs.

Question records need response type, prompt, options when relevant, answer rules, explanation, and evidence. Distinguish objective answers from suggested open responses. Assets need stable paths, source attribution, verification status, and timestamps or segment ranges where applicable. Images need appropriate alternative descriptions.

Attempts reference activity version and preserve responses separately from content. This prevents content edits from silently changing the meaning of older results.

Use draft, verified, and published content states. Release one checked activity per supported interaction type before importing the remaining bank. Preserve original sources.

## Curriculum restoration — 30 October 2026

The initial app exposed six curated exercise workspaces and only short theory summaries. This omitted most of the intended source progression. The lesson library now imports all seven instructional DOCX guides as 17 modules, exposing theory, exercise/planning guide, small exercises, full exercises, and review separately.

The import preserves 3,852 content blocks including original table structures, 54 figures, and all 76 audio files. The block count includes shared Reading overview/reference material reused between question-type modules. All 130 media copies were checked against their source-byte hashes before adding figure provenance metadata. Audio files remain byte-identical to their sources. This establishes extraction fidelity, not learning accuracy or audio alignment.

Most imported tasks are completed through a saved answer notebook and checked against original keys. Six existing workspaces retain their dedicated entry/scoring/recording controls. Models in full-writing sections are deliberately collapsed. Lesson notes and self-marked progress enter validated backups; older backups remain compatible. Larger Reading passages and content verification are still outstanding.
