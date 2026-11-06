# Asset provenance

The current technical field-manual theme uses no generated decorative imagery. The previous campus-journal illustrations are archived under `.impeccable/archive/campus-journal-art/` and are no longer served by the app. The original image generation records below are retained for provenance. All generated visuals used the built-in image_gen tool; originals in the generator's output directory were preserved.

| Asset | Purpose | Prompt / origin |
| --- | --- | --- |
| `.impeccable/archive/campus-journal-art/botanical.png` | Retired decorative botanical illustration | `.impeccable/prompts/botanical.txt`; referenced editorial mockup. Native RGBA transparency checked. |
| `.impeccable/archive/campus-journal-art/quiet-study.png` | Retired decorative quiet study background | `.impeccable/prompts/quiet-study.txt`; referenced `.impeccable/mocks/quiet-reference.png`. |
| `.impeccable/mocks/editorial.png` | Selected composition reference | `.impeccable/prompts/editorial.txt` |
| `.impeccable/mocks/workbench.png` | Unselected composition | `.impeccable/prompts/workbench.txt` |
| `.impeccable/mocks/daily-index.png` | Unselected composition | `.impeccable/prompts/daily-index.txt` |
| `public/media/writing-task1.png` | Original Task 1 chart | Extracted unchanged from `Writing/IELTS_Writing_Task_1_No_Vertical_Lines.docx`, Task 1, Three London bakeries. |
| `public/media/listening-part1.mp3` | Original Listening audio | Copied unchanged from `Listening/Part1_Full_Test.mp3`; full listening verification remains pending. |

Generated imagery is decorative, not evidence of student progress or institutional endorsement. Generated UI copy is not source authority. Publication permissions for supplied instructional assets remain a content release prerequisite.

## Imported lesson media

`public/media/curriculum/` contains 54 original instructional figures and 76 original audio files. `src/content/curriculum-assets.json` maps each filename to its original document/package entry or MP3 path and records the source-byte SHA-256. All 130 copies matched those hashes before provenance embedding. The figure copies subsequently gained source-origin metadata without changing the instructional imagery. All 76 MP3 copies remain byte-identical to their sources. The metadata scan found no missing provenance among the 55 shipping rasters (54 curriculum figures plus the existing standalone chart copy).

`public/curriculum/<lesson-id>.json` contains each lesson's text/table/media references, fetched when opened. `scripts/import_curriculum.py` recreates these files and preserves original DOCX/MP3 files. Audio-to-task association follows supplied filenames and still needs listening verification. No new learning illustrations were generated.
