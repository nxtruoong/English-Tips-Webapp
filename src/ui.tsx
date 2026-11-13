import { ArrowRight, BookOpen, Check, Headphones, MessageCircle, PenLine } from 'lucide-react';
import type { Activity, Skill } from './domain';

export const icons = { Listening: Headphones, Speaking: MessageCircle, Reading: BookOpen, Writing: PenLine };
export const skillDescriptions: Record<Skill, string> = {
  Listening: 'Điền thông tin và phân biệt đáp án gây nhiễu.',
  Speaking: 'Phát triển câu trả lời, ghi âm và tự đánh giá.',
  Reading: 'Đọc hiểu và đối chiếu bằng chứng.',
  Writing: 'Lập dàn ý, viết bài và so sánh bài mẫu.',
};
export function StageBar({ completed, current }: { completed: number; current?: number }) {
  return (
    <span className="stage-bar" aria-hidden="true">
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} className={i < completed ? 'done' : i === current ? 'current' : ''} />
      ))}
    </span>
  );
}
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', timeZone: 'Asia/Bangkok' }).format(
    new Date(date),
  );

export function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
export function Empty({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <div className="empty">
      <BookOpen size={36} strokeWidth={1.2} />
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="primary" onClick={onClick}>
        Mở thư viện bài luyện <ArrowRight size={18} />
      </button>
    </div>
  );
}
export function ActivityRow({
  activity,
  onClick,
  completed,
}: {
  activity: Activity;
  onClick: () => void;
  completed: boolean;
}) {
  return (
    <button className="activity-row" data-skill={activity.skill.toLowerCase()} onClick={onClick}>
      <div>
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>
        <span className="metadata">
          <span className="skill-label">{activity.skill}</span> · {activity.part} · {activity.technique}
        </span>
      </div>
      <span className="row-end">
        {completed && <Check size={17} aria-label="Đã luyện" />}
        {activity.minutes} phút
        <ArrowRight size={19} />
      </span>
    </button>
  );
}
