import { CalendarCheck, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StudyData } from '../domain';
import { currentStreak, goalOptions, longestStreak, minutesPerStep } from '../streak';

/** Streak, today's goal and any extra daily counters, shown at the top of Hôm nay. */
export function StudyStrip({
  data,
  todayKey,
  setGoal,
  children,
}: {
  data: StudyData;
  todayKey: string;
  setGoal: (goal: number) => void;
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
          <small>
            {streak === 0
              ? 'Hoàn thành 1 bước hoặc 1 lượt luyện để bắt đầu chuỗi.'
              : doneToday
                ? `Hôm nay đã tính. Dài nhất: ${best} ngày.`
                : `Học hôm nay để giữ chuỗi. Dài nhất: ${best} ngày.`}
          </small>
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
          <label className="strip-goal">
            <span>Mỗi ngày</span>
            <select value={goal} onChange={e => setGoal(Number(e.target.value))}>
              {goalOptions.map(option => (
                <option key={option} value={option}>
                  {option} bước · khoảng {option * minutesPerStep} phút
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {children}
    </section>
  );
}
