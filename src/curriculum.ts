import source from './content/curriculum.json';
import index from './content/curriculum-index.json';
import type { Skill } from './domain';

export const stages = ['theory', 'guide', 'small', 'full', 'review'] as const;
export type LessonStage = typeof stages[number];
export const stageLabels: Record<LessonStage,string> = {
  theory: 'Lý thuyết', guide: 'Hướng dẫn làm bài', small: 'Bài tập nhỏ', full: 'Bài tập đầy đủ', review: 'Đáp án & xem lại',
};
export interface LessonProgress {
  stage: LessonStage;
  completed: LessonStage[];
  notes: Record<string,string>;
}
export type ContentBlock =
  | { id: string; kind: 'text'; text: string; heading?: boolean; style?: string }
  | { id: string; kind: 'table'; rows: string[][] }
  | { id: string; kind: 'image'; url: string; alt: string }
  | { id: string; kind: 'audio'; url: string; text: string };
export interface LessonUnit {
  id: string; title: string; skill: Skill; part: string; source: string;
  stages: Record<LessonStage,ContentBlock[]>;
  linkedActivities: string[];
}
// Source data comes from the standard-library DOCX importer, not generated summaries.
export const lessons = source as LessonUnit[];
export type LessonMeta = Omit<LessonUnit,'stages'>;
export const lessonIndex = index as LessonMeta[];
export const initialLessonProgress = (): LessonProgress => ({ stage: 'theory', completed: [], notes: {} });
export function isLessonStage(value: string): value is LessonStage { return stages.some(stage => stage === value); }
