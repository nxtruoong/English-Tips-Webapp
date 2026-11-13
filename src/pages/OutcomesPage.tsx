import { useState } from 'react';
import { ExternalLink, TriangleAlert } from 'lucide-react';
import {
  compiledOn,
  scaleLabel,
  scaleMax,
  schools,
  type Program,
  type ProgramKind,
  type Score,
} from '../content/outcomes';
import { PageTitle } from '../ui';
import { asset } from '../asset';
import { GuideTabs } from './GuideTabs';

const storageKey = 'hien.outcomes.school';
const kindLabel: Record<ProgramKind, string | null> = {
  graduation: null,
  entry: 'Điều kiện đầu vào',
  unclear: 'Chưa đủ cơ sở',
};

function readSchool() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && schools.some(s => s.id === saved)) return saved;
  } catch {
    // Storage blocked: fall back to the first school.
  }
  return schools[0].id;
}

function formatScore({ scale, value }: Score) {
  return scale === 'ielts' ? value.toFixed(1) : String(value);
}

function ScoreMeter({ score }: { score: Score }) {
  const max = scaleMax[score.scale];
  const percent = Math.min(100, (score.value / max) * 100);
  return (
    <div className="outcome-score">
      <span className="outcome-score-label">{scaleLabel[score.scale]}</span>
      <strong>
        <span aria-hidden="true">≥</span> {formatScore(score)}
      </strong>
      <span
        className="outcome-track"
        role="img"
        aria-label={`${formatScore(score)} trên thang ${score.scale === 'ielts' ? '9.0' : max}`}
      >
        <span className="outcome-fill" style={{ width: `${percent}%` }} />
      </span>
      <span className="outcome-scale">/ {score.scale === 'ielts' ? '9.0' : max}</span>
    </div>
  );
}

function ProgramRow({ program }: { program: Program }) {
  const badge = kindLabel[program.kind];
  return (
    <li className={`outcome-row outcome-${program.kind}`}>
      <div className="outcome-name">
        <h3>{program.name}</h3>
        <span className="outcome-tags">
          {program.cohort && <span className="outcome-tag">Khóa {program.cohort}</span>}
          {badge && <span className="outcome-tag outcome-tag-warn">{badge}</span>}
        </span>
      </div>
      {program.scores.length > 0 && (
        <div className="outcome-scores">
          {program.scores.map(score => (
            <ScoreMeter key={score.scale} score={score} />
          ))}
        </div>
      )}
      {program.extra && (
        <ul className="outcome-extra">
          {program.extra.map(line => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <a className="outcome-source" href={program.source.url} target="_blank" rel="noreferrer">
        {program.source.label}
        <ExternalLink size={14} aria-hidden="true" />
        <span className="visually-hidden">(mở tab mới)</span>
      </a>
    </li>
  );
}

function BrokenNote({ text }: { text: string }) {
  return (
    <span className="link-broken">
      <TriangleAlert size={14} aria-hidden="true" />
      {text}
    </span>
  );
}

export function OutcomesPage() {
  const [schoolId, setSchoolId] = useState(readSchool);
  const school = schools.find(s => s.id === schoolId) || schools[0];
  function choose(id: string) {
    setSchoolId(id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {
      // Not critical; the choice just won't be remembered.
    }
  }
  return (
    <>
      <GuideTabs current="outcomes" />
      <PageTitle
        title="Chuẩn đầu ra ngoại ngữ"
        description={`Mức tiếng Anh cần có để tốt nghiệp đại học chính quy tại UIT, HCMUS, HCMUT và UEH. Tổng hợp từ văn bản gốc ngày ${compiledOn}.`}
      />
      <p className="outcome-caution">
        <strong>Kiểm tra đúng khóa của bạn.</strong> Mức chuẩn thay đổi theo chương trình và khóa tuyển sinh.
        Điều kiện đầu vào hoặc chuyển giai đoạn không phải chuẩn tốt nghiệp. Mỗi dòng có link tới văn bản gốc.
      </p>
      <div className="outcome-tabs" role="group" aria-label="Chọn trường">
        {schools.map(s => (
          <button
            key={s.id}
            className={s.id === school.id ? 'selected' : ''}
            aria-pressed={s.id === school.id}
            onClick={() => choose(s.id)}
          >
            <span className="outcome-logo">
              <img src={asset(s.logo)} alt="" width={44} height={44} />
            </span>
            <span className="outcome-tab-text">
              <strong>{s.short}</strong>
              <small>{s.name}</small>
            </span>
          </button>
        ))}
      </div>
      <section className="outcome-school" aria-labelledby="outcome-school-name">
        <header className="outcome-school-head">
          <span className="outcome-logo outcome-logo-lg">
            <img src={asset(school.logo)} alt={`Logo ${school.short}`} width={64} height={64} />
          </span>
          <div>
            <h2 id="outcome-school-name">
              {school.short} <span>· {school.name}</span>
            </h2>
            <p>{school.basis}</p>
            {[
              ...new Set(
                school.groups.flatMap(g => g.programs.map(p => p.source.broken)).filter(Boolean) as string[],
              ),
            ].map(text => (
              <BrokenNote key={text} text={text} />
            ))}
          </div>
        </header>
        {school.groups.map(group => (
          <div className="outcome-group" key={group.title}>
            <h3 className="outcome-group-title">{group.title}</h3>
            <ul className="outcome-list">
              {group.programs.map(program => (
                <ProgramRow key={program.name} program={program} />
              ))}
            </ul>
          </div>
        ))}
        {school.notes.length > 0 && (
          <div className="outcome-notes">
            {school.notes.map(note => (
              <p key={note.title}>
                <strong>{note.title}</strong> {note.text}{' '}
                {note.link && (
                  <a href={note.link.url} target="_blank" rel="noreferrer">
                    {note.link.label}
                  </a>
                )}
                {note.link?.broken && <BrokenNote text={note.link.broken} />}
              </p>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
