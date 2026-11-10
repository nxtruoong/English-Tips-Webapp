import { ArrowLeft, ArrowRight, Compass, GraduationCap, LibraryBig, type LucideIcon } from 'lucide-react';
import { PageTitle } from '../ui';

const tabs: { id: string; label: string; text: string; Icon: LucideIcon }[] = [
  {
    id: 'outcomes',
    label: 'Chuẩn đầu ra',
    text: 'Mức TOEIC/IELTS cần có để tốt nghiệp ở UIT, HCMUS, HCMUT, UEH — kèm văn bản gốc.',
    Icon: GraduationCap,
  },
  {
    id: 'methods',
    label: 'Phương pháp học',
    text: 'Cách học theo trình độ, quỹ thời gian, mục tiêu và rào cản của bạn.',
    Icon: Compass,
  },
  {
    id: 'resources',
    label: 'Tài nguyên miễn phí',
    text: 'Từ điển, flashcard, luyện đề, sửa bài viết… dùng được mà không tốn tiền.',
    Icon: LibraryBig,
  },
];
export const guideRoutes = ['guide', ...tabs.map(t => t.id)];

export function GuideTabs({ current }: { current: string }) {
  return (
    <>
      <a className="guide-back" href="#guide">
        <ArrowLeft size={18} aria-hidden="true" />
        Cẩm nang
      </a>
      <nav className="guide-tabs" aria-label="Cẩm nang">
        {tabs.map(({ id, label, Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={id === current ? 'active' : ''}
            aria-current={id === current ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}

export function GuidePage() {
  return (
    <>
      <PageTitle
        title="Cẩm nang"
        description="Thông tin để tự quyết định học gì và học thế nào: chuẩn đầu ra của trường, phương pháp học, và công cụ miễn phí."
      />
      <div className="guide-cards">
        {tabs.map(({ id, label, text, Icon }) => (
          <a key={id} href={`#${id}`} className="guide-card">
            <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
            <h2>{label}</h2>
            <p>{text}</p>
            <span className="guide-card-go">
              Mở <ArrowRight size={16} aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
