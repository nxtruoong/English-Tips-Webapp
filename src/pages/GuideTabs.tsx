const tabs = [
  { id: 'outcomes', label: 'Chuẩn đầu ra' },
  { id: 'methods', label: 'Phương pháp học' },
  { id: 'resources', label: 'Tài nguyên miễn phí' },
];
export const guideRoutes = tabs.map(t => t.id);

export function GuideTabs({ current }: { current: string }) {
  return (
    <nav className="guide-tabs" aria-label="Cẩm nang">
      {tabs.map(tab => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className={tab.id === current ? 'active' : ''}
          aria-current={tab.id === current ? 'page' : undefined}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
