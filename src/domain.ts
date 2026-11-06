import type { LessonProgress } from './curriculum';

export type Skill = 'Listening' | 'Speaking' | 'Reading' | 'Writing';
export interface Question {
  id: string;
  prompt: string;
  accepted: string[];
  explanation: string;
  options?: string[];
  compact?: boolean;
  maxWords?: number;
}
export interface Activity {
  id: string;
  version: number;
  skill: Skill;
  part: string;
  title: string;
  description: string;
  minutes: number;
  technique: string;
  theory: string;
  instructions: string;
  source: string;
  verification: string;
  passage?: string;
  /** Heading above the source material; defaults to a generic label per skill. */
  sourceHeading?: string;
  /** Alt text for `image`. Required whenever `image` is set. */
  imageAlt?: string;
  /** Lesson stage whose page links to this workspace. Defaults to 'full'. */
  lessonStage?: 'small' | 'full';
  /** Show on the overview as the quick practice, previewing this question. */
  preview?: { questionId: string };
  audio?: string;
  image?: string;
  transcript?: string;
  questions: Question[];
  prompts?: string[];
  model?: string;
  checklist?: string[];
}
export interface Attempt {
  id: string;
  activityId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  responses: Record<string, string>;
  plan: string;
  draft: string;
  revisions: { text: string; date: string }[];
  checks: string[];
  status: 'draft' | 'completed';
  revealed: boolean;
  score?: number;
  recording?: Blob;
}
export interface StudyData {
  schema: 1;
  attempts: Attempt[];
  saved: string[];
  lessons: Record<string, LessonProgress>;
}
export const emptyData = (): StudyData => ({ schema: 1, attempts: [], saved: [], lessons: {} });

export function normalize(value: string, compact = false): string {
  const text = value.normalize('NFKC').trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
  return compact ? text.replace(/\s/g, '') : text;
}
export function isCorrect(question: Question, response = ''): boolean {
  const text = normalize(response, question.compact);
  if (!text) return false;
  if (question.maxWords && response.trim().split(/\s+/).length > question.maxWords) return false;
  return question.accepted.some(answer => normalize(answer, question.compact) === text);
}
export function score(activity: Activity, responses: Record<string, string>): number {
  return activity.questions.filter(question => isCorrect(question, responses[question.id])).length;
}
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
export function newAttempt(activity: Activity): Attempt {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    activityId: activity.id,
    version: activity.version,
    createdAt: now,
    updatedAt: now,
    responses: {},
    plan: '',
    draft: '',
    revisions: [],
    checks: [],
    status: 'draft',
    revealed: false,
  };
}
