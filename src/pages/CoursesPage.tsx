import { ArrowRight } from 'lucide-react';
import { skills } from '../content/activities';
import { lessonIndex as lessons, stages, type LessonMeta } from '../curriculum';
import type { Skill, StudyData } from '../domain';
import { PageTitle, StageBar } from '../ui';

export function CoursesPage({
  data,
  filter,
  setFilter,
  openLesson,
}: {
  data: StudyData;
  filter: Skill | 'all';
  setFilter: (skill: Skill | 'all') => void;
  openLesson: (unit: LessonMeta) => void;
}) {
  const shown = lessons.filter(lesson => filter === 'all' || lesson.skill === filter);
  return (
    <>
      <PageTitle title="Bài học theo lộ trình" />
      <div className="pill-tabs" role="group" aria-label="Lọc bài học">
        {(['all', ...skills] as const).map(skill => (
          <button
            key={skill}
            className={filter === skill ? 'selected' : ''}
            data-skill={skill === 'all' ? undefined : skill.toLowerCase()}
            aria-pressed={filter === skill}
            onClick={() => setFilter(skill)}
          >
            {skill !== 'all' && <span className="dot" aria-hidden="true" />}
            {skill === 'all' ? 'Tất cả' : skill}
            <small>{skill === 'all' ? lessons.length : lessons.filter(l => l.skill === skill).length}</small>
          </button>
        ))}
      </div>
      <div className="lesson-grid">
        {shown.map(lesson => {
          const progress = data.lessons[lesson.id];
          const done = progress?.completed.length || 0;
          return (
            <button
              className="lesson-card"
              data-skill={lesson.skill.toLowerCase()}
              key={lesson.id}
              onClick={() => openLesson(lesson)}
            >
              <span className="lesson-card-top">
                <span className="eyebrow">
                  {lesson.skill} · {lesson.part.replace(/^Question type/i, 'Dạng')}
                </span>
              </span>
              <strong className="lesson-card-title">{lesson.title}</strong>
              <StageBar completed={done} current={progress ? stages.indexOf(progress.stage) : undefined} />
              <span className="lesson-card-foot">
                <span>{done === 5 ? 'Đã xong 5 bước' : `${done}/5 bước`}</span>
                <span className="go">
                  {progress ? 'Học tiếp' : 'Bắt đầu'} <ArrowRight size={16} aria-hidden="true" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="library-note">
        Bài tập lấy từ tài liệu gốc: làm vào ô bài làm rồi tự đối chiếu với đáp án gốc. 6 bài có workspace
        luyện riêng trong mục Luyện tập.
      </p>
    </>
  );
}
