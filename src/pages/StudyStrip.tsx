import { CalendarCheck, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StudyData } from '../domain';
import { currentStreak, longestStreak } from '../streak';

/** Streak, today's goal and any extra daily counters, shown at the top of Hôm nay. */
export function StudyStrip({
  data,
  todayKey,
  children,
}: {
  data: StudyData;
  todayKey: string;
  children?: ReactNode;
}) {
  const streak = currentStreak(data.studyDays, todayKey);
  const best = longestStreak(data.studyDays);
  const doneToday = data.studyDays[todayKey] || 0;
  const goal = data.dailyGoal;
  const met = doneToday >= goal;
  return (
    <section className="study-strip" aria-label="Tiến độ hằng ngày">
      <div className="strip-cell">
        <CalendarCheck size={22} strokeWidth={1.6} aria-hidden="true" />
        <div>
          <span className="strip-label">Chuỗi ngày học</span>
          <strong className="strip-value">{streak} ngày</strong>
          {best > streak && <small>Dài nhất: {best} ngày</small>}
        </div>
      </div>
      <div className={met ? 'strip-cell goal met' : 'strip-cell goal'}>
        <Target size={22} strokeWidth={1.6} aria-hidden="true" />
        <div>
          <span className="strip-label">Mục tiêu hôm nay</span>
          <strong className="strip-value">
            {Math.min(doneToday, goal)}/{goal} bước
            {met && <span className="strip-badge">Đã đạt</span>}
          </strong>
          <span
            className="meter"
            role="progressbar"
            aria-label="Mục tiêu hôm nay"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={Math.min(doneToday, goal)}
          >
            <span style={{ width: `${Math.min(1, doneToday / goal) * 100}%` }} />
          </span>
        </div>
      </div>
      {children}
    </section>
  );
}
