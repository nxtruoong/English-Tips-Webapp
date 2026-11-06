import { ArrowRight, Search } from 'lucide-react';
import { activities, skills } from '../content/activities';
import type { Activity, Skill, StudyData } from '../domain';
import { ActivityRow, PageTitle } from '../ui';
import { filterActivities } from '../domain';

export function PracticePage({
  data,
  filter,
  setFilter,
  part,
  setPart,
  query,
  setQuery,
  duration,
  setDuration,
  start,
  go,
}: {
  data: StudyData;
  filter: Skill | 'all';
  setFilter: (skill: Skill | 'all') => void;
  part: string;
  setPart: (part: string) => void;
  query: string;
  setQuery: (query: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  start: (activity: Activity) => void;
  go: (destination: string) => void;
}) {
  const visibleActivities = filterActivities(activities, { skill: filter, part, duration, query });
  return (
    <>
      <PageTitle title="Thư viện bài luyện" description="Lọc theo kỹ năng, dạng bài và thời lượng." />
      <button className="text-button" onClick={() => go('courses')}>
        Học lý thuyết, hướng dẫn và bài tập theo lộ trình
        <ArrowRight size={17} />
      </button>
      <div className="filters">
        <div className="skill-tabs" aria-label="Lọc kỹ năng">
          {(['all', ...skills] as const).map(skill => (
            <button
              className={filter === skill ? 'selected' : ''}
              key={skill}
              onClick={() => {
                setFilter(skill);
                setPart('all');
              }}
              aria-pressed={filter === skill}
            >
              {skill === 'all' ? 'Tất cả' : skill}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Tìm bài luyện"
            placeholder="Tìm chủ đề, kỹ thuật…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>
        <div className="select-filters">
          <label>
            Phần{' '}
            <select value={part} onChange={e => setPart(e.target.value)}>
              <option value="all">Tất cả</option>
              {[
                ...new Set(activities.filter(a => filter === 'all' || a.skill === filter).map(a => a.part)),
              ].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Thời lượng{' '}
            <select value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="short">Tối đa 10 phút</option>
              <option value="medium">11–20 phút</option>
              <option value="long">Trên 20 phút</option>
            </select>
          </label>
        </div>
      </div>
      <p className="library-note">
        Bộ khởi đầu · 6 bài luyện từ tài liệu của bạn. Reading hiện có hai bài ngắn; bài dài sẽ được thêm sau.
      </p>
      <div className="activity-list">
        {visibleActivities.map(a => (
          <ActivityRow
            key={a.id}
            activity={a}
            onClick={() => start(a)}
            completed={data.attempts.some(at => at.activityId === a.id && at.status === 'completed')}
          />
        ))}
        {visibleActivities.length === 0 && (
          <div className="empty">
            <Search />
            <h2>Chưa tìm thấy bài phù hợp.</h2>
            <p>Thử một từ khóa khác hoặc bỏ bộ lọc.</p>
            <button
              onClick={() => {
                setFilter('all');
                setQuery('');
                setPart('all');
                setDuration('all');
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </>
  );
}
