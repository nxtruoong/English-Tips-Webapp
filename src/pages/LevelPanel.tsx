import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, HelpCircle, X } from 'lucide-react';
import { lessonIndex, type LessonMeta } from '../curriculum';
import type { StudyData } from '../domain';
import {
  levelFromAnswers,
  levelIds,
  levelPaths,
  levelQuestions,
  suggestedLessons,
  type Level,
} from '../content/levels';

const laterKey = 'hien.levelLater';
function readLater() {
  try {
    return localStorage.getItem(laterKey) === '1';
  } catch {
    return false;
  }
}
function writeLater(value: boolean) {
  try {
    if (value) localStorage.setItem(laterKey, '1');
    else localStorage.removeItem(laterKey);
  } catch {
    // Not critical: the prompt simply shows again next time.
  }
}

/** Three level choices with what learners at each level can usually do. */
export function LevelPicker({
  level,
  suggested,
  onPick,
}: {
  level?: Level;
  /** Highlight a level recommended by the self-check. */
  suggested?: Level;
  onPick: (level: Level) => void;
}) {
  return (
    <div className="level-picker" role="group" aria-label="Chọn trình độ">
      {levelIds.map(id => (
        <button
          key={id}
          className={[level === id ? 'selected' : '', suggested === id ? 'suggested' : ''].join(' ').trim()}
          aria-pressed={level === id}
          onClick={() => onPick(id)}
        >
          <span className="level-choice-head">
            <strong>{levelPaths[id].label}</strong>
            {level === id && <Check size={16} aria-hidden="true" />}
            {suggested === id && level !== id && <em>Gợi ý</em>}
          </span>
          {levelPaths[id].canDo.map(line => (
            <span key={line} className="level-cando">
              {line}
            </span>
          ))}
        </button>
      ))}
    </div>
  );
}

/**
 * Self-check: one question at a time, then a recommended level with a preview of
 * what changes. Nothing is saved until the learner confirms.
 */
export function LevelQuiz({
  onConfirm,
  onCancel,
}: {
  onConfirm: (level: Level) => void;
  onCancel: () => void;
}) {
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [override, setOverride] = useState<Level>();
  const box = useRef<HTMLDivElement>(null);
  const focusFirst = () =>
    requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('h3, button.primary')?.focus());
  const step = answers.length;
  if (step < levelQuestions.length)
    return (
      <div className="level-quiz" ref={box}>
        <div className="quiz-progress">
          <span>
            Câu {step + 1}/{levelQuestions.length}
          </span>
          <span className="meter" aria-hidden="true">
            <span style={{ width: `${(step / levelQuestions.length) * 100}%` }} />
          </span>
        </div>
        <h3 tabIndex={-1}>{levelQuestions[step]}</h3>
        <div className="actions quiz-answers">
          <button
            className="primary"
            onClick={() => {
              setAnswers([...answers, true]);
              focusFirst();
            }}
          >
            Đúng với mình
          </button>
          <button
            onClick={() => {
              setAnswers([...answers, false]);
              focusFirst();
            }}
          >
            Chưa
          </button>
        </div>
        <div className="quiz-nav">
          {step > 0 && (
            <button className="text-button" onClick={() => setAnswers(answers.slice(0, -1))}>
              <ArrowLeft size={16} /> Câu trước
            </button>
          )}
          <button className="text-button" onClick={onCancel}>
            Thôi, tự chọn
          </button>
        </div>
      </div>
    );
  const recommended = levelFromAnswers(answers);
  const chosen = override || recommended;
  const path = levelPaths[chosen];
  const first = lessonIndex.find(l => l.id === suggestedLessons(chosen, {})[0]);
  const yes = answers.filter(Boolean).length;
  return (
    <div className="level-quiz result" ref={box}>
      <p className="quiz-kicker">
        Bạn trả lời “Đúng” {yes}/{levelQuestions.length} câu. Hiên gợi ý:
      </p>
      <h3 tabIndex={-1}>{levelPaths[recommended].label}</h3>
      <p className="level-note">{levelPaths[recommended].summary}</p>
      <p className="quiz-kicker">Thấy chưa đúng? Chọn mức khác:</p>
      <LevelPicker level={override} suggested={recommended} onPick={setOverride} />
      <div className="quiz-preview">
        <strong>Khi chọn “{path.label}”, trang Tổng quan sẽ:</strong>
        <ul>
          {first && (
            <li>
              Gợi ý bắt đầu với {first.skill} · {first.part} ({first.title})
            </li>
          )}
          <li>Nhắc 3 cách học: {path.tips.map(t => t.title.toLocaleLowerCase('vi')).join(', ')}</li>
          <li>Vẫn mở mọi bài; đổi lại bất cứ lúc nào trong Cài đặt</li>
        </ul>
      </div>
      <div className="actions">
        <button className="primary" onClick={() => onConfirm(chosen)}>
          <Check size={18} />
          Dùng trình độ {path.label}
        </button>
        <button
          className="text-button"
          onClick={() => {
            setAnswers([]);
            setOverride(undefined);
            focusFirst();
          }}
        >
          Làm lại
        </button>
      </div>
    </div>
  );
}

/** First visit: choose directly or take the self-check. Afterwards: tips and next lessons. */
export function LevelPanel({
  data,
  setLevel,
  openLesson,
}: {
  data: StudyData;
  setLevel: (level: Level) => void;
  openLesson: (unit: LessonMeta) => void;
}) {
  const [later, setLater] = useState(readLater);
  const [quiz, setQuiz] = useState(false);
  const pick = (level: Level) => {
    writeLater(false);
    setLevel(level);
  };
  if (!data.level && later)
    return (
      <div className="level-later">
        <Compass size={18} aria-hidden="true" />
        <span>Chưa chọn trình độ, nên lộ trình đang theo thứ tự mặc định.</span>
        <button
          className="text-button"
          onClick={() => {
            writeLater(false);
            setLater(false);
          }}
        >
          Chọn trình độ
        </button>
      </div>
    );
  if (!data.level)
    return (
      <section className="panel level-panel" aria-labelledby="level-title">
        <div className="panel-head">
          <h2 id="level-title">
            <Compass size={18} aria-hidden="true" />
            {quiz ? 'Kiểm tra nhanh trình độ' : 'Bạn đang ở trình độ nào?'}
          </h2>
          <button
            className="text-button"
            onClick={() => {
              writeLater(true);
              setLater(true);
            }}
          >
            <X size={16} /> Để sau
          </button>
        </div>
        {quiz ? (
          <LevelQuiz onConfirm={pick} onCancel={() => setQuiz(false)} />
        ) : (
          <>
            <p className="level-note">
              Chọn mức gần đúng nhất để Hiên sắp thứ tự bài và gợi ý cách học. Không phải bài kiểm tra; mọi
              bài vẫn mở.
            </p>
            <LevelPicker onPick={pick} />
            <button className="level-unsure" onClick={() => setQuiz(true)}>
              <HelpCircle size={18} aria-hidden="true" />
              <span>
                <strong>Chưa chắc?</strong> Trả lời {levelQuestions.length} câu Đúng/Chưa, khoảng 1 phút.
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </section>
    );
  const path = levelPaths[data.level];
  const next = suggestedLessons(data.level, data.lessons)
    .slice(0, 3)
    .map(id => lessonIndex.find(l => l.id === id))
    .filter((l): l is LessonMeta => Boolean(l));
  return (
    <section className="panel level-panel" aria-labelledby="level-title">
      <div className="panel-head">
        <h2 id="level-title">
          <Compass size={18} aria-hidden="true" />
          Gợi ý cho trình độ {path.label}
        </h2>
        <a href="#data">Đổi trình độ</a>
      </div>
      <div className="level-body">
        <ul className="level-tips">
          {path.tips.map(tip => (
            <li key={tip.title}>
              <strong>{tip.title}</strong>
              <span>{tip.text}</span>
              {tip.link && <a href={tip.link.href}>{tip.link.label}</a>}
            </li>
          ))}
        </ul>
        <div className="level-next">
          <h3>Bài nên học tiếp</h3>
          <ol>
            {next.map(lesson => {
              const done = data.lessons[lesson.id]?.completed.length || 0;
              return (
                <li key={lesson.id} data-skill={lesson.skill.toLowerCase()}>
                  <button onClick={() => openLesson(lesson)}>
                    <span>
                      <small className="eyebrow">
                        {lesson.skill} · {lesson.part}
                      </small>
                      {lesson.title}
                    </span>
                    <small>{done}/5</small>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
          <a href="#methods">Xem phương pháp học đầy đủ</a>
        </div>
      </div>
    </section>
  );
}
