// Self-reported level → suggested lesson order and study tips. Suggestions only:
// every lesson stays open. Tips follow the level plans in guide.ts (methods page).
import type { Level } from './guide';
import type { LessonProgress } from '../curriculum';

export type { Level };
export const levelIds: Level[] = ['beginner', 'intermediate', 'advanced'];

export interface LevelPath {
  label: string;
  summary: string;
  /** What learners at this level can usually do, to help them recognise themselves. */
  canDo: string[];
  tips: { title: string; text: string; link?: { href: string; label: string } }[];
  /** Every lesson id exactly once, in suggested order. */
  order: string[];
}

export const levelPaths: Record<Level, LevelPath> = {
  beginner: {
    label: 'Mới bắt đầu',
    summary: 'Chưa vững phát âm, vốn từ ít, chưa biết bắt đầu từ đâu.',
    canDo: ['Hiểu câu chào hỏi, câu hỏi rất đơn giản', 'Đọc chậm, còn phải tra nhiều từ'],
    tips: [
      {
        title: 'Phát âm qua video ngắn',
        text: 'Mỗi ngày 2–3 âm. Đọc thử với nhận diện giọng nói trên điện thoại: máy ghi đúng chữ là bạn đọc đúng.',
      },
      {
        title: '5 từ mới mỗi ngày',
        text: 'Thêm từ vào bộ thẻ và ôn theo lịch; ít nhưng đều hơn học dồn.',
        link: { href: '#cards', label: 'Mở Từ vựng' },
      },
      {
        title: 'Nghe thụ động',
        text: 'Nghe hội thoại ngắn, tốc độ chậm lúc đi xe hay nghỉ giải lao. Chưa hiểu hết cũng được.',
      },
    ],
    order: [
      'listening-1',
      'speaking-1',
      'reading-1',
      'reading-6',
      'listening-2',
      'reading-5',
      'speaking-2',
      'writing-1',
      'listening-3',
      'reading-8',
      'reading-2',
      'reading-4',
      'reading-7',
      'reading-3',
      'speaking-3',
      'listening-4',
      'writing-2',
    ],
  },
  intermediate: {
    label: 'Trung bình',
    summary: 'Nắm ngữ pháp cơ bản, đọc được đoạn ngắn, thiếu từ vựng và chưa quen tốc độ nói.',
    canDo: [
      'Đọc hiểu đoạn ngắn, nghe được khi nói chậm',
      'Viết email ngắn nhưng còn lỗi, nói còn ngập ngừng',
    ],
    tips: [
      {
        title: 'Chép chính tả',
        text: 'Nghe câu ngắn rồi gõ lại để lộ ra âm bị nuốt, nối âm và từ hay bỏ sót.',
        link: { href: '#tools', label: 'Xem DailyDictation' },
      },
      {
        title: 'Đọc đoạn ngắn',
        text: 'Mỗi ngày một đoạn 200–300 từ; lưu từ mới vào bộ thẻ ngay khi gặp.',
      },
      {
        title: 'Luyện đề và sửa lỗi',
        text: 'Làm bài rồi dành phần lớn thời gian cho câu sai: vì sao sai, bằng chứng nằm ở đâu.',
        link: { href: '#practice', label: 'Mở Luyện tập' },
      },
    ],
    order: [
      'listening-2',
      'reading-1',
      'listening-3',
      'reading-3',
      'reading-6',
      'writing-1',
      'speaking-2',
      'reading-4',
      'reading-5',
      'reading-7',
      'writing-2',
      'speaking-3',
      'listening-4',
      'reading-2',
      'reading-8',
      'listening-1',
      'speaking-1',
    ],
  },
  advanced: {
    label: 'Khá',
    summary: 'Nghe và giao tiếp ổn, còn khó với nội dung chuyên sâu và từ vựng chuyên ngành.',
    canDo: ['Giao tiếp được về chủ đề quen thuộc', 'Xem video, đọc tài liệu tiếng Anh, chỉ vướng thuật ngữ'],
    tips: [
      {
        title: 'Tài liệu chuyên ngành',
        text: 'Đọc tài liệu, báo cáo, bài giảng ngành mình bằng tiếng Anh; ghi lại thuật ngữ mới.',
      },
      {
        title: 'Từ vựng theo ngữ cảnh',
        text: 'Kiểm tra cụm từ có tự nhiên không bằng câu thật thay vì dịch từng từ.',
        link: { href: '#tools', label: 'Xem Ludwig.guru' },
      },
      {
        title: 'Viết email, báo cáo',
        text: 'Viết ngắn mỗi tuần, nhờ chatbot góp ý văn phong rồi tự viết lại.',
      },
    ],
    order: [
      'listening-4',
      'writing-2',
      'speaking-3',
      'reading-3',
      'reading-2',
      'reading-4',
      'writing-1',
      'listening-3',
      'reading-7',
      'speaking-2',
      'reading-5',
      'reading-6',
      'reading-8',
      'reading-1',
      'listening-2',
      'listening-1',
      'speaking-1',
    ],
  },
};

export function isLevel(value: unknown): value is Level {
  return levelIds.some(id => id === value);
}

/**
 * Lesson ids in the level's order, unfinished ones first. A lesson already
 * started comes before untouched ones so the learner continues where they are.
 */
export function suggestedLessons(level: Level, progress: Record<string, LessonProgress>): string[] {
  const done = (id: string) => (progress[id]?.completed.length || 0) >= 5;
  const started = (id: string) => (progress[id]?.completed.length || 0) > 0;
  const order = levelPaths[level].order;
  return [
    ...order.filter(id => started(id) && !done(id)),
    ...order.filter(id => !started(id)),
    ...order.filter(done),
  ];
}

/** Short self-check for learners unsure of their level. Each "yes" adds one point. */
export const levelQuestions: string[] = [
  'Bạn nghe hiểu câu hỏi đơn giản như “Where do you live?” khi người nói chậm và rõ.',
  'Bạn đọc một đoạn tin ngắn tiếng Anh và nắm được ý chính, chỉ cần tra vài từ.',
  'Bạn tự viết được email ngắn khoảng 5–6 câu, ít lỗi ngữ pháp cơ bản.',
  'Bạn nói được 1–2 phút về một chủ đề quen thuộc mà không phải dừng lại nghĩ nhiều.',
  'Bạn đọc tài liệu chuyên ngành hoặc xem video tiếng Anh mà không cần phụ đề tiếng Việt.',
];

/** 0–1 "yes" → beginner, 2–3 → intermediate, 4–5 → advanced. */
export function levelFromAnswers(answers: boolean[]): Level {
  const yes = answers.filter(Boolean).length;
  return yes <= 1 ? 'beginner' : yes <= 3 ? 'intermediate' : 'advanced';
}
