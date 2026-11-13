---
name: Hiên
description: A practical technical field manual for independent IELTS practice.
colors:
  paper: "#f3f5f9"
  sheet: "#fff"
  ink: "#182438"
  text: "#29364b"
  muted: "#59677b"
  line: "#dce2eb"
  accent: "#2454d6"
  accent-hover: "#1943b5"
  tint: "#edf2ff"
  nav: "#152034"
  nav-text: "#e3eaf5"
  danger: "#b02c2c"
  focus: "#638dff"
  button-border: "#bac5d6"
  button-hover: "#eaf0fb"
  field-border: "#b5c1d2"
  correct: "#edf7f1"
  incorrect: "#fff1ed"
  error-bg: "#fff0ef"
  error-text: "#992323"
typography:
  display:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  passage:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.95
  label:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  metadata:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "12px"
    lineHeight: 1.8
rounded:
  flat: "0"
  tag: "3px"
  feedback: "4px"
  control: "5px"
  workspace: "6px"
  panel: "7px"
spacing:
  action-gap: "10px"
  mobile-gutter: "18px"
  panel-padding: "22px"
  dashboard-gap: "24px"
  workspace-padding: "25px"
  workspace-gap: "26px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.control}"
    padding: "12px 19px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.sheet}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-secondary-hover:
    backgroundColor: "{colors.button-hover}"
  button-text:
    textColor: "{colors.accent}"
    rounded: "{rounded.flat}"
    padding: "7px 0"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  skill-filter-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  lesson-stage-selected:
    backgroundColor: "{colors.tint}"
    textColor: "#1c47b8"
    rounded: "{rounded.control}"
    padding: "12px 10px"
  lesson-content:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.workspace}"
    padding: "26px"
  workspace:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.workspace}"
    padding: "{spacing.workspace-padding}"
---

# Design System: Hiên

## Overview

**Creative North Star: "The Technical Field Manual"**

Hiên is a practical IELTS workspace for Vietnamese university students, primarily in technology-related majors. Graphite navigation, cool white workspaces, cobalt actions, and compact sans-serif headings make study tasks easy to locate and complete. Audience relevance comes from clarity and useful information, without gender stereotypes.

The interface uses direct Vietnamese instructions alongside English learning material. Fine dividers, labeled steps, and reference panes support deliberate practice and evidence review. Tokens live in `src/styles/tokens.css`; component styles in `src/theme.css` reference them. Never add raw hex colors or pixel font sizes outside the token file.

**Key Characteristics:**

- Graphite navigation and white workspaces on a cool neutral background.
- One sans-serif family with clear task hierarchy and measured density.
- Flat lists, explicit states, and study information derived from actual work.

## Colors

The palette combines cool slate neutrals with a single cobalt action accent. Frontmatter records the reusable source values.

### Primary

- **Cobalt action** (`accent`): starting practice, submitting answers, links, selected filters, and question numbers.
- **Deep cobalt** (`accent-hover`): hover emphasis on primary and text actions.
- **Reference tint** (`tint`): notices and supporting study labels.
- **Focus blue** (`focus`): visible keyboard focus on the light workspace.

### Neutral

- **Cool background** (`paper`): the application canvas.
- **White workspace** (`sheet`): editable work, reference material, and grouped lists.
- **Graphite navigation** (`nav`) and **light navigation text** (`nav-text`): persistent orientation.
- **Heading ink**, **body slate**, and **muted slate** (`ink`, `text`, `muted`): readable hierarchy.
- **Cool divider** (`line`): group boundaries without raised cards.
- **Control borders** (`button-border`, `field-border`): distinguish interactive controls from white workspaces.

Correct and incorrect answers use pale state fills with explicit review text. Error surfaces pair readable red copy with a pale red background. Green completion styling indicates a completed task, without implying an assessed IELTS band.

**The State Evidence Rule.** Use color alongside a visible label or explanation; color alone never communicates study results.

## Typography

**Display and body font:** Be Vietnam Pro, with sans-serif fallback. Latin and Vietnamese subsets are self-hosted at weights (400), (500), and (600).

The same clear family carries navigation, interface instructions, English passages, and drafts. Weight and spacing establish hierarchy; literary serif and decorative monospace treatments do not belong to this identity.

### Hierarchy

- **Display:** the frontmatter role is the general page heading; library and workspace headings use (30px), with mobile overrides around (26–27px).
- **Headline and title:** general section headings use the frontmatter roles. Compact panel headings commonly use (15–17px).
- **Body:** ordinary interface copy uses the body role; task instructions commonly use (13px) with generous leading.
- **Passage:** English source material uses the passage role, bounded at (72ch). Models use (14px) with the same generous leading.
- **Labels:** medium weight distinguishes controls. Secondary metadata uses `--text-xs` (12px), the smallest size in the scale; dates, counters, and timers use tabular numerals where defined.

The type scale has eight steps: `--text-xs` 12, `--text-sm` 13, `--text-md` 14, `--text-lg` 16, `--text-xl` 18, `--text-2xl` 22, `--text-3xl` 26, `--text-4xl` 30 (px). Nothing renders below 12px.
- **Writing:** drafts use (15px) with (1.9) line height; planning fields use (13px).

**The One Family Rule.** Use Be Vietnam Pro for both learning material and interface chrome; preserve Vietnamese glyph coverage.

## Layout

Desktop has a sticky navigation rail (228px) and a shrinkable main region bounded at (1680px). Main padding is (38px 35px 24px). The dashboard uses a fluid task column and a (285px) supporting column, separated by the dashboard gap. Skill and activity indexes are flat rows inside ruled white containers.

Study workspaces use two equal columns when each pane gets at least 420px and a single column otherwise (`auto-fit`), so they adapt without a breakpoint. Each pane has independent white framing and workspace padding. Reading text, models, and supporting descriptions have bounded line lengths.

The layout uses three breakpoints: mobile (760px and below), compact (1200px and below), and wide (1600px and above).

At (1200px) and below, the rail narrows to (196px), main padding becomes (31px 25px 22px), and workspace padding becomes (21px). Between (761px) and (1200px), the dashboard stacks with two supporting panels side by side.

At (760px) and below, navigation moves above the content as four equal tabs with the icon above a single-line label. Main padding becomes (26px 18px 22px). Dashboard panels stack; study panes use mutually exclusive source/work views controlled by sticky tabs. Filters and actions wrap, activity metadata moves below descriptions, and long provenance text wraps anywhere. Keep every content column shrinkable.

At (1600px) and above, main padding increases to (43px 45px 27px), the supporting column becomes (320px), and the dashboard gap becomes (28px).

The lesson reader extends the same workspace with five equal stage controls, an (8px) gap, and a (195px) sticky overview beside a shrinkable reading column, separated by (23px). The overview sits (24px) from the viewport top. The reader surface uses (26px) padding. At (1200px) and below, it becomes one column with (23px) padding; source provenance moves into an in-content disclosure. At (760px) and below, stage controls form two columns with the final review control spanning both, the gap becomes (7px), and reader padding becomes (20px 16px). Tables scroll inside their own focusable regions instead of widening the page.

## Elevation & Depth

The interface has no ambient card shadows. White surfaces, cool tints, fine borders, and spacing establish depth. Navigation states use tonal fills and borders within the graphite rail.

A short workspace entrance uses (180ms) timing with a small vertical shift and blur. Button state transitions use (150ms). Reduced-motion preference disables animation, transitions, and smooth scrolling.

## Shapes

Controls have restrained corners using the control radius. Study panes use the workspace radius; dashboard panels use the panel radius. Tags use the smaller tag radius. Feedback uses the feedback radius. Structural borders are generally (1px); rows within a container remain square and separated by rules. Avoid pill-shaped navigation or floating tile collections.

## Components

### Buttons

Primary actions use cobalt fill and white text. Secondary actions use white fill, slate text, and a cool border. Text actions use cobalt without a surrounding box and gain an underline on hover. Standard controls have a minimum height of (44px). Disabled buttons use (0.55) opacity and a not-allowed cursor.

Focus is a (3px) outline with (4px) offset. Navigation uses a lighter focus color against graphite. Preserve the focus-visible skip link.

### Inputs and fields

Inputs and textareas use white fill, a fine field border, control corners, and the field padding. Disabled fields use a pale cool fill while retaining readable text. Textareas resize vertically. Native radio and checkbox controls use cobalt accents. File import exposes focus on its visible label.

### Navigation and filters

Navigation combines line icons with visible labels. Active routes use a lighter graphite-blue fill, a border, white text, and `aria-current`. The primary destinations are Cẩm nang, Tổng quan, Bài học, Luyện tập, Từ vựng, Ôn lại, and Công cụ. Mobile navigation remains a labeled horizontal row; when the labels do not fit, the row scrolls on its own (never the page) and keeps the current destination in view. Skill filters use a cobalt selected fill and expose pressed state; workspace tabs also expose pressed state.

### Containers and indexes

Dashboard panels use white backgrounds, fine cool borders, and panel corners. The skill and activity indexes use full-width action rows separated by fine rules; hover adds a faint blue fill. Counts show actual available activities. Study summary values show actual completed work and saved questions.

### Daily progress, flashcards and level suggestions

Tổng quan opens with a study strip of equal cells (streak, today's goal, due flashcards) inside one card, separated by fine rules. Values use tabular numerals; a met goal adds a green "Đã đạt" label rather than relying on color. A first-visit level picker uses three bordered choices with `aria-pressed`; after a choice, a suggestions panel pairs three tips with the next lessons. Flashcard review shows one card at a time: the meaning stays hidden until requested, then Quên/Nhớ state their next interval in text, and focus stays inside the card. Styles live in `src/styles/features.css` and use tokens only.

### Study workspace and feedback

Source and work panes share equal visual weight. Source material, charts, native audio, answer fields, and provenance remain live, readable content. Answer review combines tinted feedback with explanations. Completion uses a restrained green banner. Storage failures, recording permissions, saved drafts, reveal states, and recovery actions remain explicit.

The redesign ships no decorative raster imagery. Source charts and audio remain learning material with their existing provenance. Historical campus-journal art is archived outside shipping assets.

### Lesson reader and source material

The Bài học index presents 17 source modules through the existing flat activity rows. Each module has five independently accessible stages: Lý thuyết, Hướng dẫn làm bài, Bài tập nhỏ, Bài tập đầy đủ, and Đáp án & xem lại. Stage controls pair numbered (23px) squares with visible labels. The current step uses a cobalt border, reference tint, and `aria-current="step"`; a check replaces the number for learner-marked completion. The completion toggle exposes `aria-pressed`. Its count describes stages the learner marked as studied, not objectively correct answers or an assessed score.

Source sections use native disclosures with ruled boundaries. The initial theory section opens by default; model answers remain closed with an explicit suggestion to open after attempting the exercise. Search appears for stages with more than five sections and has a visible no-results message. Source paragraphs use (14px), (1.95) leading, and a (75ch) maximum; on mobile they use (13px) and (2) leading. Figures preserve their source proportions, cap their height at (750px), and link to the original image for enlargement. Tables retain source rows with (12px) text, a tinted first row, and a (400px) minimum width within horizontal scrolling. Mobile table cells use (11px) text.

Audio is grouped in a labeled disclosure with native players, deferred preload, and explicit load failure/retry controls. Source filenames and limitations remain available through Nguồn & lưu ý, including the in-content disclosure when the overview is hidden. Figures and audio are source evidence; embedded figure provenance and `src/content/curriculum-assets.json` record their origin.

Per-exercise notebooks and stage notes use labeled, vertically resizable fields, (14px) text, and visible local-save guidance. Notes survive stage changes. Save status and storage failures remain explicit. Linked practice actions open the existing answer or recording workspace. Lesson JSON loads on demand with a visible loading status and a recoverable error alert; retry preserves saved work. Use the same recovery pattern for audio failure.

## Do's and Don'ts

### Do:

- **Do** use graphite navigation, cool white workspaces, cobalt actions, and clear sans-serif hierarchy.
- **Do** keep selected, saved, submitted, and error states explicit in text and semantics.
- **Do** preserve keyboard focus, readable learning material, and reduced-motion behavior.
- **Do** derive study counts and progress from actual activity and saved work.
- **Do** label learner-marked stage completion separately from assessed answer correctness.

### Don't:

- **Don't** reintroduce botanical imagery, literary serif styling, motivational slogans, or decorative code.
- **Don't** turn flat study indexes into floating decorative card collections.
- **Don't** invent analytics, official endorsement, or automated band scores.
- **Don't** use decorative artwork or generated copy as learning evidence.
