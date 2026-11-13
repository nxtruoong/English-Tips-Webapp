import { useState } from 'react';
import { ExternalLink, Users } from 'lucide-react';
import { speakingPlaces, toolGroups, toolSkills, type ToolSkill } from '../content/tools';
import { PageTitle } from '../ui';
import { asset } from '../asset';

export function ToolsPage() {
  const [skill, setSkill] = useState<ToolSkill | 'all'>('all');
  const groups = toolGroups
    .map(group => ({
      ...group,
      items: group.items.filter(tool => skill === 'all' || tool.skills.includes(skill)),
    }))
    .filter(group => group.items.length);
  const total = toolGroups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <PageTitle title="Công cụ miễn phí" description={`${total} công cụ, dùng bản miễn phí là đủ.`} />
      <div className="skill-tabs tool-filters" role="group" aria-label="Lọc theo kỹ năng">
        {(['all', ...toolSkills] as const).map(option => (
          <button
            key={option}
            className={skill === option ? 'selected' : ''}
            aria-pressed={skill === option}
            onClick={() => setSkill(option)}
          >
            {option === 'all' ? 'Tất cả' : option}
          </button>
        ))}
      </div>
      {groups.map(group => (
        <section className="guide-section" key={group.title} aria-label={group.title}>
          <h2 className="outcome-group-title">{group.title}</h2>
          <ul className="outcome-list">
            {group.items.map(tool => (
              <li key={tool.name}>
                <a className="resource-row" href={tool.url} target="_blank" rel="noreferrer">
                  <img className="resource-icon" src={asset(tool.icon)} alt="" width={28} height={28} />
                  <span className="resource-main">
                    <strong>{tool.name}</strong>
                    <span>{tool.use}</span>
                  </span>
                  <span className="tool-skills">
                    {tool.skills.map(s => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <ExternalLink size={16} aria-hidden="true" />
                  <span className="visually-hidden">(mở tab mới)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="guide-section speak-places" aria-labelledby="speak-title">
        <h2 className="outcome-group-title" id="speak-title">
          Nơi luyện nói miễn phí
        </h2>
        <div className="speak-grid">
          {speakingPlaces.map(place => (
            <article key={place.title} className="panel">
              <h3>
                <Users size={18} aria-hidden="true" />
                {place.title}
              </h3>
              <p>{place.text}</p>
              <ul>
                {place.tips.map(tip => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
