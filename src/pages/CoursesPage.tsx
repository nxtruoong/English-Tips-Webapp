import { ArrowRight } from 'lucide-react';
import { skills } from '../content/activities';
import { lessonIndex as lessons, type LessonMeta } from '../curriculum';
import type { Skill, StudyData } from '../domain';
import { PageTitle, icons } from '../ui';

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
  return (
    <>
      <PageTitle
        title="Bài học theo lộ trình"
        description="Lý thuyết → Hướng dẫn làm bài → Bài tập nhỏ → Bài tập đầy đủ → Đáp án & xem lại."
      />
      <div className="skill-tabs" aria-label="Lọc bài học">
        {(['all', ...skills] as const).map(skill => (
          <button
            key={skill}
            className={filter === skill ? 'selected' : ''}
            aria-pressed={filter === skill}
            onClick={() => setFilter(skill)}
          >
            {skill === 'all' ? 'Tất cả' : skill}
          </button>
        ))}
      </div>
      <p className="library-note">
        {lessons.length} bài học từ 7 tài liệu kỹ năng. Reading có đủ các dạng trong tài liệu hiện tại; nguồn
        bài dài vẫn cần bổ sung. Bài tập nhập theo nội dung gốc dùng ô bài làm và tự đối chiếu; 6 workspace
        hiện có hỗ trợ luyện riêng.
      </p>
      <div className="activity-list">
        {lessons
          .filter(lesson => filter === 'all' || lesson.skill === filter)
          .map(lesson => {
            const Icon = icons[lesson.skill];
            const progress = data.lessons[lesson.id];
            return (
              <button className="activity-row" key={lesson.id} onClick={() => openLesson(lesson)}>
                <Icon size={29} />
                <div>
                  <h2>
                    {lesson.skill} · {lesson.part}
                  </h2>
                  <p>{lesson.title}</p>
                  <span className="metadata">
                    5 bước · {progress?.completed.length || 0}/5 đã đánh dấu học xong
                  </span>
                </div>
                <span className="row-end">
                  {progress ? 'Học tiếp' : 'Mở bài học'}
                  <ArrowRight size={18} />
                </span>
              </button>
            );
          })}
      </div>
    </>
  );
}
