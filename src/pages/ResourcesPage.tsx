import { ExternalLink } from 'lucide-react';
import { budgets, priceLabel, resourceGroups } from '../content/guide';
import { PageTitle } from '../ui';
import { asset } from '../asset';
import { GuideTabs } from './GuideTabs';

export function ResourcesPage() {
  const total = resourceGroups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <GuideTabs current="resources" />
      <PageTitle
        title="Tài nguyên học miễn phí"
        description={`${total} công cụ dùng được mà không tốn tiền, xếp theo việc cần làm. “Có bản miễn phí” nghĩa là có gói trả phí nhưng bản miễn phí vẫn dùng được; giá và giới hạn có thể thay đổi.`}
      />
      <div className="outcome-notes budget-notes">
        {budgets.map(b => (
          <p key={b.title}>
            <strong>{b.title}</strong> {b.text}
          </p>
        ))}
      </div>
      {resourceGroups.map(group => (
        <section className="guide-section" key={group.title} aria-label={group.title}>
          <h2 className="outcome-group-title">{group.title}</h2>
          <ul className="outcome-list">
            {group.items.map(r => (
              <li key={r.name}>
                <a className="resource-row" href={r.url} target="_blank" rel="noreferrer">
                  <img className="resource-icon" src={asset(r.icon)} alt="" width={28} height={28} />
                  <span className="resource-main">
                    <strong>{r.name}</strong>
                    <span>{r.use}</span>
                    {r.note && <small>{r.note}</small>}
                  </span>
                  <span className={`price price-${r.price}`}>{priceLabel[r.price]}</span>
                  <ExternalLink size={16} aria-hidden="true" />
                  <span className="visually-hidden">(mở tab mới)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
