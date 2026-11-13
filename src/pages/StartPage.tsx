import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenText, Compass, WalletCards } from 'lucide-react';
import { lessonIndex, stageLabels, stages, type LessonMeta } from '../curriculum';
import type { StudyData } from '../domain';
import { levelPaths, suggestedLessons, type Level } from '../content/levels';
import { goalOptions, minutesPerStep } from '../streak';
import { LevelPicker, LevelQuiz } from './LevelPanel';

const doneKey = 'hien.started';
/** True once the learner finished or skipped the start guide on this browser. */
export function startSeen(): boolean {
  try {
    return localStorage.getItem(doneKey) === '1';
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    localStorage.setItem(doneKey, '1');
  } catch {
    // Not critical: the guide may show again on a later visit.
  }
}

const steps = ['Cách dùng', 'Trình độ', 'Bài đầu tiên'];

const howTo = [
  { Icon: Compass, title: 'Chọn trình độ', text: 'Bài học sẽ xếp theo mức của bạn.' },
  {
    Icon: BookOpenText,
    title: 'Học theo 5 bước',
    text: 'Lý thuyết → hướng dẫn → bài tập nhỏ → bài đầy đủ → đáp án.',
  },
  {
    Icon: WalletCards,
    title: 'Ôn mỗi ngày',
    text: 'Lưu từ mới thành thẻ, mỗi ngày ôn một ít.',
  },
];

/** First-visit guide: how the app works → pick a level → open the first suggested lesson. */
export function StartPage({
  data,
  setLevel,
  setGoal,
  openLesson,
  go,
}: {
  data: StudyData;
  setLevel: (level: Level) => void;
  setGoal: (goal: number) => void;
  openLesson: (unit: LessonMeta) => void;
  go: (destination: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const page = useRef<HTMLDivElement>(null);
  // Each step replaces the buttons that were just used; move focus to the new heading.
  const focusTitle = () =>
    requestAnimationFrame(() => page.current?.querySelector<HTMLElement>('#start-title')?.focus());
  const show = (next: number) => {
    setStep(next);
    focusTitle();
  };
  const toggleQuiz = (value: boolean) => {
    setQuiz(value);
    focusTitle();
  };
  const pick = (level: Level) => {
    setLevel(level);
    setQuiz(false);
    show(2);
  };
  const first = data.level
    ? lessonIndex.find(l => l.id === suggestedLessons(data.level!, data.lessons)[0])
    : undefined;
  const finish = (then: () => void) => {
    markSeen();
    then();
  };

  return (
    <div className="start-page" ref={page}>
      <ol className="start-steps" aria-label="Các bước bắt đầu">
        {steps.map((label, i) => (
          <li
            key={label}
            className={i === step ? 'current' : i < step ? 'done' : ''}
            aria-current={i === step ? 'step' : undefined}
          >
            <span>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="start-card" aria-labelledby="start-title">
          <h1 id="start-title" tabIndex={-1}>
            Chào mừng đến với Hiên
          </h1>
          <p className="start-lead">
            Luyện tiếng Anh theo 4 kỹ năng, miễn phí, bài làm lưu ngay trên máy bạn.
          </p>
          <ol className="start-howto">
            {howTo.map(({ Icon, title, text }, i) => (
              <li key={title}>
                <span className="start-num">{i + 1}</span>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <div className="actions">
            <button className="primary" onClick={() => show(1)}>
              Bắt đầu <ArrowRight size={18} />
            </button>
            <button className="text-button" onClick={() => finish(() => go('today'))}>
              Bỏ qua, vào Tổng quan
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="start-card" aria-labelledby="start-title">
          <h1 id="start-title" tabIndex={-1}>
            {quiz ? 'Kiểm tra nhanh trình độ' : 'Bạn đang ở trình độ nào?'}
          </h1>
          {quiz ? (
            <LevelQuiz onConfirm={pick} onCancel={() => toggleQuiz(false)} />
          ) : (
            <>
              <LevelPicker level={data.level} onPick={pick} />
              <button className="level-unsure" onClick={() => toggleQuiz(true)}>
                <Compass size={18} aria-hidden="true" />
                <span>
                  <strong>Chưa chắc?</strong> Trả lời 5 câu hỏi nhanh
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </>
          )}
          <div className="actions start-nav">
            <button className="text-button" onClick={() => show(0)}>
              <ArrowLeft size={16} /> Quay lại
            </button>
            {data.level && !quiz && (
              <button className="text-button" onClick={() => show(2)}>
                Giữ mức {levelPaths[data.level].label} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      )}

      {step === 2 && first && data.level && (
        <section className="start-card" aria-labelledby="start-title">
          <h1 id="start-title" tabIndex={-1}>
            Bài đầu tiên của bạn
          </h1>
          <p className="start-lead">Gợi ý cho trình độ {levelPaths[data.level].label}.</p>
          <div className="start-lesson" data-skill={first.skill.toLowerCase()}>
            <span className="eyebrow">
              {first.skill} · {first.part}
            </span>
            <h2>{first.title}</h2>
            <ol>
              {stages.map((stage, i) => (
                <li key={stage}>
                  <span>{i + 1}</span>
                  {stageLabels[stage]}
                </li>
              ))}
            </ol>
          </div>
          <label className="start-goal">
            <span>Mục tiêu mỗi ngày</span>
            <select value={data.dailyGoal} onChange={e => setGoal(Number(e.target.value))}>
              {goalOptions.map(option => (
                <option key={option} value={option}>
                  {option} bước · khoảng {option * minutesPerStep} phút
                </option>
              ))}
            </select>
          </label>
          <div className="actions">
            <button className="primary" onClick={() => finish(() => openLesson(first))}>
              Vào bài học <ArrowRight size={18} />
            </button>
            <button className="text-button" onClick={() => finish(() => go('today'))}>
              Xem Tổng quan
            </button>
          </div>
          <div className="actions start-nav">
            <button className="text-button" onClick={() => show(1)}>
              <ArrowLeft size={16} /> Đổi trình độ
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
