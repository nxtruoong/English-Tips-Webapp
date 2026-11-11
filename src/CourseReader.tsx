import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, Headphones, PenLine } from 'lucide-react';
import { activities } from './content/activities';
import {
  stageLabels,
  stages,
  type ContentBlock,
  type LessonProgress,
  type LessonStage,
  type LessonUnit,
  type LessonMeta,
} from './curriculum';
import { asset } from './asset';
import { StageBar } from './ui';

const unitCache = new Map<string, Promise<LessonUnit>>();
function loadUnit(id: string): Promise<LessonUnit> {
  let pending = unitCache.get(id);
  if (!pending) {
    pending = fetch(asset(`/curriculum/${encodeURIComponent(id)}.json`)).then(async response => {
      if (!response.ok) throw new Error('Không tải được nội dung bài học.');
      const unit: LessonUnit = await response.json();
      if (unit.id !== id || !stages.every(stage => Array.isArray(unit.stages?.[stage])))
        throw new Error('Nội dung bài học không hợp lệ.');
      return unit;
    });
    unitCache.set(id, pending);
    pending.catch(() => unitCache.delete(id));
  }
  return pending;
}
interface ReaderProps {
  unit: LessonUnit;
  stage: LessonStage;
  progress: LessonProgress;
  saveState: string;
  onChange: (patch: Partial<LessonProgress>) => void;
  onNavigate: (stage: LessonStage) => void;
  onBack: () => void;
  onPractice: (activityId: string) => void;
}
export function CourseLoader(props: Omit<ReaderProps, 'unit'> & { unit: LessonMeta }) {
  const [unit, setUnit] = useState<LessonUnit>();
  const [error, setError] = useState(false);
  const id = props.unit.id;
  useEffect(() => {
    let active = true;
    loadUnit(id)
      .then(value => {
        if (active) setUnit(value);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [id]);
  function retry() {
    setError(false);
    loadUnit(id)
      .then(setUnit)
      .catch(() => setError(true));
  }
  if (error)
    return (
      <div className="empty" role="alert">
        <h1>Không tải được bài học.</h1>
        <p>Kiểm tra kết nối rồi tải lại. Bài làm đã lưu không bị xóa.</p>
        <button onClick={retry}>Thử lại</button>
      </div>
    );
  if (!unit)
    return (
      <div className="empty" role="status">
        Đang tải nội dung bài học…
      </div>
    );
  return <CourseReader {...props} unit={unit} />;
}

function SourceAudio({ url, title }: { url: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  return (
    <div className="source-audio">
      <p>{title}</p>
      <audio
        key={version}
        controls
        preload="none"
        src={url}
        aria-label={title}
        onError={() => setFailed(true)}
      />
      {failed && (
        <p role="alert" className="error">
          Không tải được audio.{' '}
          <button
            onClick={() => {
              setFailed(false);
              setVersion(v => v + 1);
            }}
          >
            Thử lại
          </button>
        </p>
      )}
    </div>
  );
}

/** Bold a short "Label:" lead-in so list items scan quickly. */
function withLabel(text: string) {
  const at = text.indexOf(':');
  const label = text.slice(0, at);
  if (at < 1 || at > 70 || label.split(/\s+/).length > 9 || /[_|]/.test(label)) return text;
  return (
    <>
      <strong>{label}:</strong>
      {text.slice(at + 1)}
    </>
  );
}

/**
 * Source paragraphs arrive one per block as plain text. Recognise the document's own
 * structure (phases, numbered steps, bullets) and present it, without changing the words.
 */
export function SourceText({ text, style }: { text: string; style?: string }) {
  const t = text.trim();
  if (/^(?:Giai đoạn|Bước|Bẫy|Stage|Step|Phase)\s*\d+\s*[:.–-]/i.test(t))
    return <h4 className="src-phase">{t}</h4>;
  const numbered = /^(\d+)\.\s+(.*)$/s.exec(t);
  if (numbered) {
    const [, n, rest] = numbered;
    if (!rest.includes(':') && !rest.includes('|') && rest.length < 70 && !/[.?!]$/.test(rest))
      return (
        <h4 className="src-subhead">
          <span className="src-num">{n}</span>
          {rest}
        </h4>
      );
    return (
      <p className="source-paragraph src-step">
        <span className="src-num">{n}</span>
        <span>{withLabel(rest)}</span>
      </p>
    );
  }
  const bullet = /^[•▪◦·]\s*(.*)$/s.exec(t);
  if (bullet || style === 'ListBullet')
    return <p className="source-paragraph src-bullet">{withLabel(bullet ? bullet[1] : t)}</p>;
  return <p className="source-paragraph">{text}</p>;
}

function SourceBlock({ block }: { block: ContentBlock }) {
  if (block.kind === 'text')
    return block.heading ? <h3>{block.text}</h3> : <SourceText text={block.text} style={block.style} />;
  if (block.kind === 'image')
    return (
      <figure>
        <a href={asset(block.url)} target="_blank" rel="noreferrer">
          <img loading="lazy" src={asset(block.url)} alt={block.alt} />
        </a>
        <figcaption>
          <a href={asset(block.url)} target="_blank" rel="noreferrer">
            Mở hình gốc để phóng to
          </a>
        </figcaption>
      </figure>
    );
  if (block.kind === 'audio') return <SourceAudio url={asset(block.url)} title={block.text} />;
  return (
    <div className="lesson-table-scroll" role="region" aria-label="Bảng trong tài liệu gốc" tabIndex={0}>
      <table>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface Section {
  id: string;
  title: string;
  blocks: ContentBlock[];
  exercise: boolean;
  model: boolean;
}
export function sourceSections(blocks: ContentBlock[]): Section[] {
  const sections: Section[] = [];
  for (const block of blocks) {
    if (block.kind === 'audio') continue;
    if (block.kind === 'text' && block.heading) {
      const exercise = /^(?:[EFWP]\d+\b|Task \d+\b)/i.test(block.text);
      sections.push({
        id: block.id,
        title: block.text,
        blocks: [],
        exercise,
        model: /^(?:M\d+\b|.*(?:model (?:answer|essay|talk)|sample (?:answer|essay)|bài mẫu))/i.test(
          block.text,
        ),
      });
    } else {
      if (!sections.length)
        sections.push({
          id: 'introduction',
          title: 'Nội dung tài liệu',
          blocks: [],
          exercise: false,
          model: false,
        });
      sections[sections.length - 1].blocks.push(block);
    }
  }
  return sections;
}

export default function CourseReader({
  unit,
  stage,
  progress,
  saveState,
  onChange,
  onNavigate,
  onBack,
  onPractice,
}: ReaderProps) {
  const [query, setQuery] = useState('');
  const blocks = unit.stages[stage];
  const groups = sourceSections(blocks);
  const matches = groups.filter(
    group =>
      !query.trim() ||
      JSON.stringify(group).toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')),
  );
  const position = stages.indexOf(stage);
  const practice = activities.filter(
    a => unit.linkedActivities.includes(a.id) && (a.lessonStage ?? 'full') === stage,
  );
  const audio = blocks.filter(b => b.kind === 'audio');
  const hasExerciseNotes = groups.some(g => g.exercise);
  const defaultOpen =
    groups.find(group => /^(?:I\.\s*Theory|Part\s+1.*Theory|Theory\s*&)/i.test(group.title))?.id ||
    (groups[0]?.blocks.length ? groups[0].id : undefined);
  // A heading with no content of its own only introduces the sections below it.
  const isDivider = (group: Section) => group.blocks.length === 0 && !group.exercise && !group.model;
  const done = progress.completed.length;
  const isDone = progress.completed.includes(stage);
  const hasNote = (key: string) => Boolean(progress.notes[`${stage}/${key}`]?.trim());
  const sectionId = (id: string) => `sec-${stage}-${id}`;
  function jumpTo(id: string) {
    const el = document.getElementById(sectionId(id));
    if (el instanceof HTMLDetailsElement) el.open = true;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function notes(key: string, label: string) {
    const id = `${unit.id}-${stage}-${key}`;
    return (
      <div className="lesson-notebook">
        <div className="notebook-head">
          <PenLine size={16} aria-hidden="true" />
          <label htmlFor={id}>{label}</label>
        </div>
        <textarea
          id={id}
          rows={5}
          value={progress.notes[`${stage}/${key}`] || ''}
          placeholder="Ghi câu trả lời, dàn ý hoặc điểm cần nhớ…"
          onChange={e => onChange({ notes: { ...progress.notes, [`${stage}/${key}`]: e.target.value } })}
        />
        <span className="small">Tự lưu trên thiết bị · đối chiếu ở bước Đáp án & xem lại.</span>
      </div>
    );
  }
  const prev = position > 0 ? stages[position - 1] : undefined;
  const next = position < stages.length - 1 ? stages[position + 1] : undefined;
  return (
    <div className="lesson-page" data-skill={unit.skill.toLowerCase()}>
      <nav className="crumbs" aria-label="Vị trí">
        <button className="back text-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Bài học
        </button>
        <span aria-hidden="true">/</span>
        <span>{unit.skill}</span>
        <span aria-hidden="true">/</span>
        <span>{unit.part}</span>
      </nav>
      <header className="lesson-hero">
        <span className="eyebrow">
          {unit.skill} · {unit.part}
        </span>
        <h1>{unit.title}</h1>
        <div className="lesson-hero-meta">
          <StageBar completed={done} current={position} />
          <span>{done}/5 bước đã xong</span>
          <span role="status">{saveState}</span>
        </div>
      </header>

      <div className="lesson-shell">
        <aside className="lesson-rail">
          <nav className="lesson-stages" aria-label="Các bước bài học">
            {stages.map((step, i) => {
              const complete = progress.completed.includes(step);
              return (
                <button
                  key={step}
                  onClick={() => onNavigate(step)}
                  aria-current={stage === step ? 'step' : undefined}
                  className={[stage === step ? 'selected' : '', complete ? 'complete' : ''].join(' ').trim()}
                >
                  <span className="stage-number">{complete ? <Check size={14} /> : i + 1}</span>
                  <span>{stageLabels[step]}</span>
                </button>
              );
            })}
          </nav>
          {groups.length > 1 && (
            <nav className="lesson-toc" aria-label="Các phần trong bước này">
              <h2>Trong bước này</h2>
              <ol>
                {groups.map(group => (
                  <li key={group.id}>
                    <button onClick={() => jumpTo(group.id)}>
                      <span>{group.title}</span>
                      {group.exercise && hasNote(group.id) && (
                        <span className="toc-dot" title="Đã có bài làm" aria-label="đã có bài làm" />
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <details className="lesson-source">
            <summary>Nguồn & lưu ý</summary>
            <p>{unit.source}</p>
            <p>
              Nội dung nhập từ tài liệu bạn cung cấp, giữ nguyên bảng và hình. Không phải tài liệu kiểm định
              của IELTS. Audio ghép theo tên file, chưa xác minh toàn bộ bằng nghe; “Full exercise” có thể chỉ
              là bài luyện một phần.
            </p>
          </details>
        </aside>

        <article className="lesson-content">
          <div className="lesson-stage-heading">
            <span className="metadata">Bước {position + 1} / 5</span>
            <h2>{stageLabels[stage]}</h2>
          </div>
          <details className="lesson-source-mobile">
            <summary>Nguồn & lưu ý</summary>
            <p>{unit.source}</p>
            <p>
              Nội dung từ tài liệu gốc. Audio ghép theo tên file và chưa được kiểm định toàn bộ bằng nghe.
              “Full exercise” có thể chỉ là bài luyện một phần, không phải bài thi hoàn chỉnh.
            </p>
          </details>
          {stage === 'small' || stage === 'full' ? (
            <p className="lesson-explainer">
              Làm bài theo đề gốc, ghi câu trả lời vào phiếu bài làm dưới mỗi bài. Bài có workspace riêng hỗ
              trợ nhập đáp án hoặc ghi âm; bài còn lại tự đối chiếu ở bước Đáp án.
            </p>
          ) : stage === 'guide' ? (
            <p className="lesson-explainer">
              Cách triển khai và lập kế hoạch từ tài liệu gốc, đặt trước bài tập.
            </p>
          ) : stage === 'review' ? (
            <p className="lesson-explainer">
              Đáp án, phân tích và bài mẫu. So với bài làm đã lưu; câu trả lời mở có thể có nhiều cách đúng.
            </p>
          ) : null}
          {practice.length > 0 && (
            <div className="linked-practice">
              {practice.map(a => (
                <button key={a.id} onClick={() => onPractice(a.id)}>
                  <FileText size={18} />
                  <span>
                    <strong>{a.title}</strong>
                    <small>Workspace luyện tập · {a.minutes} phút</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
          )}
          {audio.length > 0 && (
            <details className="lesson-audio">
              <summary>
                <Headphones size={17} />
                Audio của bước này ({audio.length})
              </summary>
              {audio.map(b => (
                <SourceBlock key={b.id} block={b} />
              ))}
            </details>
          )}
          {groups.length > 5 && (
            <label className="lesson-search">
              Tìm trong bước này
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tên dạng bài, E1, overview…"
              />
            </label>
          )}
          <div className="lesson-sections">
            {matches.map(group =>
              isDivider(group) ? (
                <h3 className="section-divider" key={group.id} id={sectionId(group.id)}>
                  {group.title}
                </h3>
              ) : (
                <details
                  className={[
                    'source-section',
                    group.exercise ? 'is-exercise' : '',
                    group.model ? 'is-model' : '',
                  ]
                    .join(' ')
                    .trim()}
                  key={group.id}
                  id={sectionId(group.id)}
                  open={group.id === defaultOpen && !group.model}
                >
                  <summary>
                    <span className="section-title">{group.title}</span>
                    <span className="section-tags">
                      {group.exercise && <span className="tag">Bài tập</span>}
                      {group.exercise && hasNote(group.id) && (
                        <span className="tag tag-done">Đã có bài làm</span>
                      )}
                      {group.model && <span className="tag tag-model">Bài mẫu · mở sau khi làm</span>}
                    </span>
                    <ChevronDown className="section-chevron" size={18} aria-hidden="true" />
                  </summary>
                  <div className="source-section-body">
                    {group.blocks.map(block => (
                      <SourceBlock key={block.id} block={block} />
                    ))}
                    {(stage === 'small' || stage === 'full') &&
                      group.exercise &&
                      notes(group.id, `Bài làm: ${group.title}`)}
                  </div>
                </details>
              ),
            )}
            {matches.length === 0 && <p>Không có mục phù hợp. Thử từ khóa khác.</p>}
          </div>
          {(!hasExerciseNotes || stage === 'theory' || stage === 'guide' || stage === 'review') &&
            notes(
              'notes',
              stage === 'small' || stage === 'full' ? 'Bài làm của bước này' : 'Ghi chú của bước này',
            )}
          <div className="lesson-stage-footer">
            <button
              className={isDone ? 'complete-toggle on' : 'complete-toggle'}
              aria-pressed={isDone}
              onClick={() =>
                onChange({
                  completed: isDone
                    ? progress.completed.filter(s => s !== stage)
                    : [...progress.completed, stage],
                })
              }
            >
              <Check size={17} />
              {isDone ? 'Đã đánh dấu học xong' : 'Đánh dấu học xong'}
            </button>
            <div className="stage-nav">
              {prev && (
                <button className="stage-link" onClick={() => onNavigate(prev)}>
                  <ArrowLeft size={17} />
                  <span>
                    <small>Bước trước</small>
                    {stageLabels[prev]}
                  </span>
                </button>
              )}
              {next && (
                <button className="stage-link next" onClick={() => onNavigate(next)}>
                  <span>
                    <small>Bước tiếp theo</small>
                    {stageLabels[next]}
                  </span>
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
