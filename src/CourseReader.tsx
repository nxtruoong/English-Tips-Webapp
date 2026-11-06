import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, Headphones } from 'lucide-react';
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

function SourceBlock({ block }: { block: ContentBlock }) {
  if (block.kind === 'text')
    return block.heading ? <h3>{block.text}</h3> : <p className="source-paragraph">{block.text}</p>;
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
    groups[0]?.id;
  function notes(key: string, label: string) {
    const id = `${unit.id}-${stage}-${key}`;
    return (
      <div className="lesson-notebook">
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          rows={5}
          value={progress.notes[`${stage}/${key}`] || ''}
          placeholder="Ghi câu trả lời, dàn ý hoặc điểm cần nhớ…"
          onChange={e => onChange({ notes: { ...progress.notes, [`${stage}/${key}`]: e.target.value } })}
        />
        <span className="small">Tự lưu trên thiết bị. Đối chiếu với bước Đáp án & xem lại.</span>
      </div>
    );
  }
  return (
    <>
      <button className="back text-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Danh sách bài học
      </button>
      <header className="workspace-heading">
        <h1>
          {unit.skill} · {unit.part}
        </h1>
        <p>{unit.title}</p>
        <div className="workspace-meta">
          <span>{progress.completed.length}/5 bước đã đánh dấu học xong</span>
          <span role="status">{saveState}</span>
        </div>
      </header>
      <nav className="lesson-stages" aria-label="Các bước bài học">
        {stages.map((step, i) => (
          <button
            key={step}
            onClick={() => onNavigate(step)}
            aria-current={stage === step ? 'step' : undefined}
            className={stage === step ? 'selected' : ''}
          >
            <span className="stage-number">
              {progress.completed.includes(step) ? <Check size={15} /> : i + 1}
            </span>
            <span>{stageLabels[step]}</span>
          </button>
        ))}
      </nav>
      <div className="lesson-layout">
        <aside className="lesson-overview">
          <h2>Nội dung bài học</h2>
          <p>Học theo thứ tự hoặc mở trực tiếp từng bước. Bài làm và ghi chú được giữ lại khi chuyển bước.</p>
          <dl>
            <div>
              <dt>Kỹ năng</dt>
              <dd>{unit.skill}</dd>
            </div>
            <div>
              <dt>Tài liệu</dt>
              <dd>{unit.part}</dd>
            </div>
          </dl>
          <details>
            <summary>Nguồn & lưu ý</summary>
            <p>{unit.source}</p>
            <p>
              Nội dung nhập từ tài liệu bạn cung cấp, giữ nguyên cả bảng và hình. Chưa phải tài liệu được kiểm
              định hoặc chứng nhận bởi IELTS.
            </p>
            <p>
              Audio được ghép theo tên file nguồn, chưa xác minh toàn bộ bằng nghe. Nhãn “Full exercise” của
              tài liệu có thể chỉ là bài luyện một phần.
            </p>
          </details>
        </aside>
        <article className="lesson-content">
          <div className="lesson-stage-heading">
            <h2>{stageLabels[stage]}</h2>
            <span className="metadata">Bước {position + 1}/5</span>
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
              Làm bài theo đề gốc và ghi câu trả lời vào ô bài làm. Các bài có nút mở workspace hỗ trợ nhập
              đáp án hoặc ghi âm riêng. Bài còn lại dùng đối chiếu đáp án và tự đánh giá.
            </p>
          ) : stage === 'guide' ? (
            <p className="lesson-explainer">
              Hướng dẫn và phần lập kế hoạch từ tài liệu gốc, đặt trước bài tập để bạn biết cách triển khai.
            </p>
          ) : stage === 'review' ? (
            <p className="lesson-explainer">
              Đáp án, phân tích và bài mẫu. So sánh với bài làm đã lưu; các câu trả lời mở có thể có nhiều
              cách đúng.
            </p>
          ) : null}
          {practice.length > 0 && (
            <div className="linked-practice">
              {practice.map(a => (
                <button key={a.id} onClick={() => onPractice(a.id)}>
                  <FileText size={17} />
                  <span>Mở workspace: {a.title}</span>
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
            {matches.map(group => (
              <details
                className="source-section"
                key={group.id}
                open={group.id === defaultOpen && !group.model}
              >
                <summary>
                  {group.title}
                  {group.model && <span className="model-label">Bài mẫu — mở sau khi làm</span>}
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
            ))}
            {matches.length === 0 && <p>Không có mục phù hợp. Thử từ khóa khác.</p>}
          </div>
          {(!hasExerciseNotes || stage === 'theory' || stage === 'guide' || stage === 'review') &&
            notes(
              'notes',
              stage === 'small' || stage === 'full' ? 'Bài làm của bước này' : 'Ghi chú của bước này',
            )}
          <div className="lesson-stage-footer">
            <button
              aria-pressed={progress.completed.includes(stage)}
              onClick={() =>
                onChange({
                  completed: progress.completed.includes(stage)
                    ? progress.completed.filter(s => s !== stage)
                    : [...progress.completed, stage],
                })
              }
            >
              <Check size={17} />
              {progress.completed.includes(stage) ? 'Đã đánh dấu học xong' : 'Đánh dấu học xong'}
            </button>
            <div className="actions">
              {position > 0 && (
                <button onClick={() => onNavigate(stages[position - 1])}>
                  <ArrowLeft size={16} />
                  Bước trước
                </button>
              )}
              {position < stages.length - 1 && (
                <button className="primary" onClick={() => onNavigate(stages[position + 1])}>
                  Bước tiếp theo
                  <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
