import { ArrowRight, Timer } from 'lucide-react';
import { activities, skills } from '../content/activities';
import {
  lessonIndex as lessons,
  stages,
  stageLabels,
  type LessonMeta,
  type LessonStage,
} from '../curriculum';
import type { Activity, Attempt, Skill, StudyData } from '../domain';
import { icons, skillDescriptions } from '../ui';

const quick = (() => {
  const activity = activities.find(a => a.preview);
  const question = activity?.questions.find(q => q.id === activity.preview?.questionId);
  return activity && question ? { activity, question } : undefined;
})();

export function TodayPage({
  data,
  today,
  pending,
  next,
  nextLesson,
  start,
  openLesson,
  setFilter,
  setPart,
  setReviewTab,
  go,
}: {
  data: StudyData;
  today: Date;
  pending?: Attempt;
  next: Activity;
  nextLesson: LessonMeta;
  start: (activity: Activity) => void;
  openLesson: (unit: LessonMeta, stage?: LessonStage) => void;
  setFilter: (skill: Skill | 'all') => void;
  setPart: (part: string) => void;
  setReviewTab: (tab: 'saved' | 'history') => void;
  go: (destination: string) => void;
}) {
  return (
    <>
      <header className="daily-heading">
        <div>
          <h1>Tổng quan học tập</h1>
          <p>Chọn bài luyện, kiểm tra kết quả và xử lý điểm yếu.</p>
        </div>
        <span className="date">
          {new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'Asia/Bangkok',
          }).format(today)}
        </span>
      </header>
      <div className="daily-grid">
        <div>
          <section className="feature">
            <div className="feature-copy">
              <h2>{pending ? next.title : `${nextLesson.skill} · ${nextLesson.part}`}</h2>
              <div className="feature-meta">
                <span className="part-label">
                  {next.skill} / {next.part}
                </span>
                <span>
                  <Timer size={15} />
                  {pending ? `${next.minutes} phút` : '5 bước học'}
                </span>
                <span className="resume-state">
                  {pending ? 'Bản nháp bài luyện' : 'Bắt đầu từ lý thuyết'}
                </span>
              </div>
              <p className="feature-description">
                {pending
                  ? next.description
                  : 'Học nội dung gốc, xem cách làm, luyện bài nhỏ rồi chuyển sang bài đầy đủ.'}
              </p>
              <button className="primary" onClick={() => (pending ? start(next) : openLesson(nextLesson))}>
                {pending ? 'Học tiếp' : 'Bắt đầu học'}
                <ArrowRight size={18} />
              </button>
            </div>
            <ol className="session-flow" aria-label="Quy trình học">
              {stages.map((step, i) => (
                <li key={step}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>{stageLabels[step]}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="skill-index" aria-label="Bốn kỹ năng">
            <div className="section-heading">
              <h2>Học theo kỹ năng</h2>
              <span>{lessons.length} bài học</span>
            </div>
            {skills.map(skill => {
              const Icon = icons[skill];
              return (
                <button
                  key={skill}
                  onClick={() => {
                    setFilter(skill);
                    setPart('all');
                    go('courses');
                  }}
                >
                  <Icon size={25} strokeWidth={1.6} />
                  <span>
                    <strong>{skill}</strong>
                    <span>{skillDescriptions[skill]}</span>
                  </span>
                  <span className="skill-count">{lessons.filter(a => a.skill === skill).length} bài học</span>
                  <ArrowRight size={18} />
                </button>
              );
            })}
          </section>
        </div>
        <aside className="daily-margin">
          <section className="study-summary">
            <h2>Tiến độ của bạn</h2>
            <dl>
              <div>
                <dt>Lượt đã hoàn thành</dt>
                <dd>{data.attempts.filter(a => a.status === 'completed').length}</dd>
              </div>
              <div>
                <dt>Bài đang học</dt>
                <dd>{data.attempts.filter(a => a.status === 'draft').length}</dd>
              </div>
              <div>
                <dt>Câu đã lưu để ôn</dt>
                <dd>{data.saved.length}</dd>
              </div>
            </dl>
            <button
              className="text-button"
              onClick={() => {
                setReviewTab('history');
                go('review');
              }}
            >
              Xem lịch sử học
              <ArrowRight size={17} />
            </button>
          </section>
          {quick && (
            <section className="reading-preview">
              <h2>Bài luyện nhanh</h2>
              <p className="metadata">
                {quick.activity.skill} · {quick.activity.technique} · {quick.activity.minutes} phút
              </p>
              <blockquote lang="en">{quick.activity.passage}</blockquote>
              <p>
                <span lang="en">“{quick.question.prompt}”</span>
                <br />
                Đối chiếu nhận định với thông tin trong đoạn văn.
              </p>
              <button className="text-button" onClick={() => start(quick.activity)}>
                Làm bài {quick.activity.skill} <ArrowRight size={17} />
              </button>
            </section>
          )}
        </aside>
      </div>
      <footer>
        Hiên · Luyện tập độc lập, không liên kết với IELTS. <span>Dữ liệu được lưu trên thiết bị này.</span>
      </footer>
    </>
  );
}
