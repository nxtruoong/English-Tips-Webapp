import { ArrowRight, Timer, WalletCards } from 'lucide-react';
import { skills } from '../content/activities';
import {
  lessonIndex as lessons,
  stages,
  stageLabels,
  type LessonMeta,
  type LessonStage,
} from '../curriculum';
import type { Activity, Attempt, Skill, StudyData } from '../domain';
import { dayKey } from '../streak';
import { StudyStrip } from './StudyStrip';
import { dueCards } from '../flashcards';
import { LevelPanel } from './LevelPanel';
import { UitNote } from './UitNote';
import type { Level } from '../content/levels';

/** Attempts touched on each of the last seven days, oldest first. */
function lastWeek(attempts: Attempt[], today: Date) {
  const counts = new Map<string, number>();
  for (const a of attempts) {
    const key = dayKey(new Date(a.updatedAt));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getTime() - (6 - i) * 86_400_000);
    return {
      key: dayKey(date),
      label: new Intl.DateTimeFormat('vi-VN', { weekday: 'narrow', timeZone: 'Asia/Bangkok' }).format(date),
      count: counts.get(dayKey(date)) || 0,
    };
  });
}

export function TodayPage({
  data,
  today,
  pending,
  next,
  nextLesson,
  start,
  openLesson,
  setReviewTab,
  go,
  setLevel,
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
  setLevel: (level: Level) => void;
}) {
  const progress = data.lessons[nextLesson.id];
  const doneHere = progress?.completed.length || 0;
  const currentIndex = stages.indexOf(progress?.stage || 'theory');
  const doneStages = lessons.reduce((n, l) => n + (data.lessons[l.id]?.completed.length || 0), 0);
  const completed = data.attempts.filter(a => a.status === 'completed').length;
  const drafts = data.attempts.filter(a => a.status === 'draft').length;
  const week = lastWeek(data.attempts, today);
  const weekMax = Math.max(1, ...week.map(d => d.count));
  const weekTotal = week.reduce((n, d) => n + d.count, 0);
  const dueCount = dueCards(data.cards, dayKey(today)).length;

  const links = [
    {
      value: completed,
      label: 'lượt luyện đã xong',
      onClick: () => {
        setReviewTab('history');
        go('review');
      },
    },
    { value: drafts, label: 'bài đang làm dở', onClick: () => go('practice') },
    {
      value: data.saved.length,
      label: 'câu đã lưu để ôn',
      onClick: () => {
        setReviewTab('saved');
        go('review');
      },
    },
  ];

  return (
    <>
      <header className="daily-heading">
        <div>
          <h1>Tổng quan học tập</h1>
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

      {!data.level && <LevelPanel data={data} setLevel={setLevel} openLesson={openLesson} />}

      <div className="today-top">
        <section
          className="hero"
          data-skill={(pending ? next.skill : nextLesson.skill).toLowerCase()}
          aria-labelledby="hero-title"
        >
          <div className="hero-main">
            <div className="hero-copy">
              <span className="eyebrow">
                {pending ? 'Bài luyện đang làm dở' : doneHere ? 'Học tiếp' : 'Gợi ý bắt đầu'}
              </span>
              <h2 id="hero-title">{pending ? next.title : `${nextLesson.skill} · ${nextLesson.part}`}</h2>
              <p>{pending ? next.description : nextLesson.title}</p>
              <span className="hero-meta">
                <Timer size={15} aria-hidden="true" />
                {pending ? `${next.minutes} phút` : `${doneHere}/5 bước đã xong`}
              </span>
            </div>
            <button
              className="primary hero-cta"
              onClick={() => (pending ? start(next) : openLesson(nextLesson))}
            >
              {pending || doneHere ? 'Học tiếp' : 'Bắt đầu học'}
              <ArrowRight size={18} />
            </button>
          </div>
          {!pending && (
            <ol className="hero-steps" aria-label="5 bước của bài học">
              {stages.map((step, i) => {
                const done = progress?.completed.includes(step);
                const state = done ? 'done' : i === currentIndex ? 'current' : '';
                return (
                  <li key={step} className={state}>
                    <button onClick={() => openLesson(nextLesson, step)}>
                      <span className="step-dot">{done ? '✓' : i + 1}</span>
                      {stageLabels[step]}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
        <StudyStrip data={data} todayKey={dayKey(today)}>
          <div className="strip-cell">
            <WalletCards size={22} strokeWidth={1.6} aria-hidden="true" />
            <div>
              <span className="strip-label">Thẻ từ vựng cần ôn</span>
              <strong className="strip-value">
                {dueCount} thẻ
                <button className="text-button" onClick={() => go('cards')}>
                  {dueCount ? 'Ôn ngay' : data.cards.length ? 'Xem bộ thẻ' : 'Thêm thẻ'}{' '}
                  <ArrowRight size={16} />
                </button>
              </strong>
            </div>
          </div>
        </StudyStrip>
      </div>

      <section className="roadmap" aria-labelledby="roadmap-title">
        <div className="roadmap-head">
          <h2 id="roadmap-title">Lộ trình</h2>
          <span>
            <strong>{doneStages}</strong> / {lessons.length * 5} bước đã xong
          </span>
        </div>
        <div className="roadmap-map">
          {skills.map(skill => (
            <div className="roadmap-group" key={skill} data-skill={skill.toLowerCase()}>
              <div className="roadmap-cols">
                {lessons
                  .filter(l => l.skill === skill)
                  .map(l => {
                    const done = data.lessons[l.id]?.completed || [];
                    return (
                      <button
                        key={l.id}
                        className={l.id === nextLesson.id ? 'col here' : 'col'}
                        title={`${l.skill} · ${l.part}: ${l.title} — ${done.length}/5 bước`}
                        aria-label={`${l.skill} ${l.part}, ${done.length}/5 bước`}
                        onClick={() => openLesson(l)}
                      >
                        {stages.map(s => (
                          <span key={s} className={done.includes(s) ? 'on' : ''} />
                        ))}
                      </button>
                    );
                  })}
              </div>
              <small>{skill}</small>
            </div>
          ))}
        </div>
        <ul className="roadmap-links">
          {links.map(link => (
            <li key={link.label}>
              <button onClick={link.onClick}>
                <strong>{link.value}</strong> {link.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="today-grid">
        <div className="today-main">
          {data.level && <LevelPanel data={data} setLevel={setLevel} openLesson={openLesson} />}
        </div>

        <aside className="today-side">
          {weekTotal > 0 && (
            <section className="panel">
              <div className="panel-head">
                <h2>7 ngày qua</h2>
                <span>{weekTotal} lượt luyện</span>
              </div>
              <div className="week-chart" role="img" aria-label={`${weekTotal} lượt luyện trong 7 ngày qua`}>
                {week.map((d, i) => (
                  <div key={d.key} className={i === 6 ? 'today' : ''}>
                    <span
                      className="bar"
                      style={{ height: `${(d.count / weekMax) * 100}%` }}
                      title={`${d.count}`}
                    />
                    <small>{d.label}</small>
                  </div>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setReviewTab('history');
                  go('review');
                }}
              >
                Xem lịch sử học <ArrowRight size={17} />
              </button>
            </section>
          )}
          <UitNote />
        </aside>
      </div>
    </>
  );
}
