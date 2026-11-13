import { ArrowRight, Compass } from 'lucide-react';
import { lessonIndex, type LessonMeta } from '../curriculum';
import type { StudyData } from '../domain';
import { levelIds, levelPaths, suggestedLessons, type Level } from '../content/levels';

/** Three level choices; pressed state shows the current one. */
export function LevelPicker({ level, onPick }: { level?: Level; onPick: (level: Level) => void }) {
  return (
    <div className="level-picker" role="group" aria-label="Trình độ hiện tại">
      {levelIds.map(id => (
        <button
          key={id}
          className={level === id ? 'selected' : ''}
          aria-pressed={level === id}
          onClick={() => onPick(id)}
        >
          <strong>{levelPaths[id].label}</strong>
          <span>{levelPaths[id].summary}</span>
        </button>
      ))}
    </div>
  );
}

/** First visit: ask for a level. Afterwards: tips and the next lessons in the suggested order. */
export function LevelPanel({
  data,
  setLevel,
  openLesson,
}: {
  data: StudyData;
  setLevel: (level: Level) => void;
  openLesson: (unit: LessonMeta) => void;
}) {
  if (!data.level)
    return (
      <section className="panel level-panel" aria-labelledby="level-title">
        <div className="panel-head">
          <h2 id="level-title">Bạn đang ở trình độ nào?</h2>
          <a href="#data">Đổi lại sau trong Cài đặt</a>
        </div>
        <p className="level-note">
          Hiên dùng lựa chọn này để gợi ý thứ tự bài học và cách học phù hợp. Mọi bài vẫn mở, bạn có thể học
          bài nào trước cũng được.
        </p>
        <LevelPicker onPick={setLevel} />
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
