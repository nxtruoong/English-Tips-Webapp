import { ArrowRight, Check, Clock, Search } from 'lucide-react';
import { activities, skills } from '../content/activities';
import type { Activity, Skill, StudyData } from '../domain';
import { icons, PageTitle } from '../ui';
import { filterActivities } from '../domain';

type Status = 'new' | 'draft' | 'done';
const statusLabel: Record<Status, string> = { new: 'Chưa làm', draft: 'Đang làm dở', done: 'Đã xong' };
const actionLabel: Record<Status, string> = { new: 'Bắt đầu', draft: 'Làm tiếp', done: 'Làm lại' };

export function PracticePage({
  data,
  filter,
  setFilter,
  query,
  setQuery,
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
  const visible = filterActivities(activities, { skill: filter, part: 'all', duration: 'all', query });
  const status = (a: Activity): Status => {
    const mine = data.attempts.filter(at => at.activityId === a.id && at.version === a.version);
    if (mine.some(at => at.status === 'draft')) return 'draft';
    return mine.some(at => at.status === 'completed') ? 'done' : 'new';
  };
  const count = (skill: Skill | 'all') => activities.filter(a => skill === 'all' || a.skill === skill).length;

  return (
    <section className="library">
      <PageTitle title="Luyện tập" />
      <div className="library-bar">
        <div className="skill-tabs" role="group" aria-label="Lọc kỹ năng">
          {(['all', ...skills] as const).map(skill => (
            <button
              key={skill}
              className={filter === skill ? 'selected' : ''}
              aria-pressed={filter === skill}
              onClick={() => setFilter(skill)}
            >
              {skill === 'all' ? 'Tất cả' : skill} <span className="library-count">{count(skill)}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Tìm bài luyện"
            placeholder="Tìm bài…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="library-grid">
        {visible.map(a => {
          const Icon = icons[a.skill];
          const s = status(a);
          return (
            <article key={a.id} className="library-card" data-skill={a.skill.toLowerCase()}>
              <div className="library-top">
                <span className="library-icon">
                  <Icon size={20} />
                </span>
                <span className="library-skill">
                  {a.skill} · {a.part}
                </span>
                <span className={`library-status ${s}`}>
                  {s === 'done' && <Check size={13} />}
                  {statusLabel[s]}
                </span>
              </div>
              <h2>{a.title}</h2>
              <p>{a.description}</p>
              <div className="library-foot">
                <span>
                  <Clock size={14} /> {a.minutes} phút
                </span>
                <button className={s === 'done' ? '' : 'primary'} onClick={() => start(a)}>
                  {actionLabel[s]} <ArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {visible.length === 0 && (
        <div className="empty">
          <Search />
          <h2>Không có bài nào khớp.</h2>
          <button
            onClick={() => {
              setFilter('all');
              setQuery('');
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
      <button className="text-button" onClick={() => go('courses')}>
        Muốn học lý thuyết trước? Xem bài học theo lộ trình <ArrowRight size={16} />
      </button>
    </section>
  );
}
