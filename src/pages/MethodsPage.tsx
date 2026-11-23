import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  aiPrompts,
  barriers,
  glossary,
  goals,
  levels,
  plans,
  resourceUrl,
  timeBudgets,
  type Level,
  type Step,
  type TimeBudget,
} from '../content/guide';
import { PageTitle } from '../ui';
import { GuideTabs } from './GuideTabs';

const storageKey = 'hien.methods.profile';
type Profile = { level: Level; time: TimeBudget };

function readProfile(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (levels.some(l => l.id === saved?.level) && timeBudgets.some(t => t.id === saved?.time)) return saved;
  } catch {
    // Ignore blocked or corrupt storage.
  }
  return { level: 'beginner', time: 'low' };
}

function ToolChips({ tools }: { tools?: string[] }) {
  if (!tools?.length) return null;
  return (
    <span className="tool-chips">
      {tools.map(tool =>
        resourceUrl[tool] ? (
          <a key={tool} href={resourceUrl[tool]} target="_blank" rel="noreferrer">
            {tool}
          </a>
        ) : (
          <span key={tool}>{tool}</span>
        ),
      )}
    </span>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or blocked permission: fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

function AiPrompts({ level }: { level: Level }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(title: string, prompt: string) {
    const ok = await copyText(prompt);
    setCopied(ok ? title : null);
    setFailed(ok ? null : title);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="guide-section" aria-labelledby="ai-prompt-title">
      <h2 id="ai-prompt-title" className="outcome-group-title">
        Luyện nói với AI
      </h2>
      <p className="ai-prompt-intro">
        Sao chép câu lệnh, dán vào ChatGPT hoặc Claude (bản miễn phí, bật chế độ giọng nói nếu có) rồi trả lời
        bằng lời. AI có thể nhận xét sai, nên tự kiểm tra lại; AI không chấm band IELTS.
      </p>
      <div className="ai-prompt-grid">
        {aiPrompts[level].map(p => (
          <article key={p.title} className="ai-prompt-card">
            <h3>{p.title}</h3>
            <p className="goal-who">{p.use}</p>
            <pre lang="en">{p.prompt}</pre>
            <button type="button" onClick={() => copy(p.title, p.prompt)}>
              {copied === p.title ? <Check size={16} /> : <Copy size={16} />}
              {copied === p.title ? 'Đã sao chép' : 'Sao chép câu lệnh'}
            </button>
            {failed === p.title && (
              <p className="ai-prompt-error" role="alert">
                Trình duyệt chặn sao chép. Bôi đen đoạn trên rồi nhấn Ctrl+C.
              </p>
            )}
          </article>
        ))}
      </div>
      <span className="visually-hidden" role="status">
        {copied ? 'Đã sao chép câu lệnh' : ''}
      </span>
    </section>
  );
}

export function MethodsPage() {
  const [profile, setProfile] = useState(readProfile);
  function update(patch: Partial<Profile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Not critical.
    }
  }
  const level = levels.find(l => l.id === profile.level) || levels[0];
  const plan = plans[profile.level];
  const steps: Step[] = plan.any || plan[profile.time] || [];
  const timeMatters = !plan.any;

  return (
    <>
      <GuideTabs current="methods" />
      <PageTitle
        title="Phương pháp học tiếng Anh"
        description="Chọn trình độ và quỹ thời gian để xem cách học phù hợp."
      />

      <section className="method-picker" aria-labelledby="picker-title">
        <h2 id="picker-title" className="outcome-group-title">
          Bạn đang ở đâu?
        </h2>
        <div className="picker-row">
          <span className="picker-label">Trình độ</span>
          <div className="segmented" role="group" aria-label="Trình độ">
            {levels.map(l => (
              <button
                key={l.id}
                className={l.id === profile.level ? 'selected' : ''}
                aria-pressed={l.id === profile.level}
                onClick={() => update({ level: l.id })}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="picker-row">
          <span className="picker-label">Thời gian</span>
          <div className="segmented" role="group" aria-label="Quỹ thời gian">
            {timeBudgets.map(t => (
              <button
                key={t.id}
                className={timeMatters && t.id === profile.time ? 'selected' : ''}
                aria-pressed={timeMatters && t.id === profile.time}
                disabled={!timeMatters}
                onClick={() => update({ time: t.id })}
              >
                <span>{t.label}</span>
                <small>{t.detail}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="method-plan" aria-live="polite">
          <p>
            <strong>Đặc điểm</strong> {level.trait}
          </p>
          {level.goal && (
            <p>
              <strong>Đích giai đoạn này</strong> {level.goal}
            </p>
          )}
          {!timeMatters && <p>Ở mức này, cách học không phụ thuộc nhiều vào quỹ thời gian.</p>}
          <ol className="plan-steps">
            {steps.map(step => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <ToolChips tools={step.tools} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AiPrompts level={profile.level} />

      <section className="guide-section" aria-labelledby="goals-title">
        <h2 id="goals-title" className="outcome-group-title">
          Theo mục tiêu
        </h2>
        <div className="goal-grid">
          {goals.map(goal => (
            <article key={goal.title} className="goal-card">
              <h3>{goal.title}</h3>
              <p className="goal-who">{goal.who}</p>
              <p className="goal-core">{goal.core}</p>
              <ul>
                {goal.steps.map(s => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section" aria-labelledby="barrier-title">
        <h2 id="barrier-title" className="outcome-group-title">
          Khi gặp rào cản
        </h2>
        <ul className="outcome-list">
          {barriers.map(b => (
            <li key={b.barrier} className="barrier-row">
              <div>
                <h3>{b.barrier}</h3>
                <span className="barrier-share">{b.survey} SV khảo sát gặp phải</span>
              </div>
              <p>
                <span>Nguyên nhân</span>
                {b.cause}
              </p>
              <p>
                <span>Cách xử lý</span>
                {b.fix}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-section" aria-labelledby="glossary-title">
        <h2 id="glossary-title" className="outcome-group-title">
          Thuật ngữ
        </h2>
        <dl className="glossary">
          {glossary.map(g => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
