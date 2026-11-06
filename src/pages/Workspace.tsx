import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronRight, Download, RotateCcw } from 'lucide-react';
import { isCorrect, score, wordCount, type Activity, type Attempt } from '../domain';
import { download } from '../storage';
import { Recorder } from '../Recorder';
import { asset } from '../asset';
import { formatDate } from '../ui';

export function Workspace({
  activity,
  attempt,
  saved,
  saveState,
  onUpdate,
  onSave,
  onRetry,
  onBack,
}: {
  activity: Activity;
  attempt: Attempt;
  saved: string[];
  saveState: string;
  onUpdate: (patch: Partial<Attempt>) => void;
  onSave: (id: string) => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const [mobileTab, setMobileTab] = useState<'source' | 'work'>('source');
  const [reveal, setReveal] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioKey, setAudioKey] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const submitted = attempt.status === 'completed';
  const objective = activity.questions.length > 0;
  const minWords = activity.part === 'Task 1' ? 150 : 250;
  const answered = activity.questions.filter(q => attempt.responses[q.id]?.trim()).length;
  useEffect(() => {
    if (!preparing || seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [preparing, seconds]);
  function showModel() {
    setReveal(true);
    if (!attempt.revealed) onUpdate({ revealed: true });
  }
  function submit() {
    if (
      objective &&
      answered < activity.questions.length &&
      !confirm(`Bạn còn ${activity.questions.length - answered} câu chưa trả lời. Vẫn nộp bài?`)
    )
      return;
    onUpdate({ status: 'completed', ...(objective ? { score: score(activity, attempt.responses) } : {}) });
    setMobileTab('work');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <>
      <button className="back text-button" onClick={onBack}>
        <ArrowLeft size={17} />
        Danh sách bài luyện
      </button>
      <header className="workspace-heading">
        <h1>{activity.title}</h1>
        <div className="workspace-meta">
          <span>
            {activity.skill} · {activity.part} · {activity.minutes} phút
          </span>
          <span role="status">{saveState}</span>
        </div>
      </header>
      <div className="mobile-tabs">
        <button
          className={mobileTab === 'source' ? 'selected' : ''}
          aria-pressed={mobileTab === 'source'}
          onClick={() => setMobileTab('source')}
        >
          Đề & tài liệu
        </button>
        <button
          className={mobileTab === 'work' ? 'selected' : ''}
          aria-pressed={mobileTab === 'work'}
          onClick={() => setMobileTab('work')}
        >
          {submitted ? 'Kết quả & xem lại' : 'Bài làm của bạn'}
        </button>
      </div>
      {submitted && (
        <section className="result-banner" aria-live="polite">
          <Check size={25} />
          <div>
            <h2>
              {objective
                ? `${attempt.score}/${activity.questions.length} câu đúng.`
                : 'Đã hoàn thành một lượt luyện.'}
            </h2>
            <p>
              {objective
                ? 'Đọc lời giải, lưu câu cần ôn, rồi thử lại khi sẵn sàng.'
                : 'Một lượt tự luyện, không phải đánh giá band. Chọn một điểm để làm tốt hơn lần sau.'}
              {attempt.revealed ? ' Bạn đã xem gợi ý hoặc bài mẫu trong lượt này.' : ''}
            </p>
          </div>
          <button onClick={onRetry}>
            <RotateCcw size={17} />
            Luyện lại
          </button>
        </section>
      )}
      <div className="workspace-grid">
        <section className={`source-pane ${mobileTab === 'source' ? 'mobile-visible' : ''}`}>
          <details className="theory" open>
            <summary>Phương pháp làm bài</summary>
            <p>{activity.theory}</p>
          </details>
          <div className="source-material">
            <h2>
              {activity.sourceHeading ??
                (activity.skill === 'Reading' ? 'Đọc và tìm bằng chứng.' : 'Đề luyện tập')}
            </h2>
            <p className="instructions" lang="en">
              {activity.instructions}
            </p>
            {activity.audio && (
              <>
                <audio
                  key={audioKey}
                  aria-label={`Audio bài nghe: ${activity.title}`}
                  controls
                  preload="metadata"
                  src={asset(activity.audio)}
                  onError={() => setAudioError(true)}
                />
                {audioError && (
                  <p className="error" role="alert">
                    Không tải được audio.{' '}
                    <button
                      onClick={() => {
                        setAudioError(false);
                        setAudioKey(k => k + 1);
                      }}
                    >
                      Tải lại audio
                    </button>{' '}
                    hoặc mở bản chép lời bên dưới.
                  </p>
                )}
              </>
            )}
            {activity.passage && (
              <p className="passage" lang="en">
                {activity.passage}
              </p>
            )}
            {activity.image && (
              <figure>
                <img className="task-image" src={asset(activity.image)} alt={activity.imageAlt ?? ''} />
                <figcaption>
                  <a href={asset(activity.image)} target="_blank" rel="noreferrer">
                    Mở hình gốc để phóng to
                  </a>
                </figcaption>
              </figure>
            )}
            {activity.prompts && (
              <ol className="speaking-prompts" lang="en">
                {activity.prompts.map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            )}
          </div>
          <details className="source-note">
            <summary>Nguồn & tình trạng nội dung</summary>
            <p>{activity.source}</p>
            <p>{activity.verification}</p>
          </details>
          {(activity.transcript || activity.model) && (
            <section className="model-section">
              <button className="text-button" onClick={() => (reveal ? setReveal(false) : showModel())}>
                {reveal ? 'Ẩn' : submitted ? 'Xem' : 'Mở sớm'}{' '}
                {activity.transcript ? 'bản chép lời' : 'bài mẫu'} <ChevronRight size={17} />
              </button>
              {!submitted && !reveal && (
                <p className="small">Nên thử trước khi xem. Nếu mở sớm, lượt học sẽ được ghi chú.</p>
              )}
              {reveal && (
                <div className="model-copy" lang="en">
                  {(activity.transcript || activity.model)?.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
        <section className={`work-pane ${mobileTab === 'work' ? 'mobile-visible' : ''}`}>
          <div className="work-heading">
            <h2>{submitted ? 'Kết quả & lời giải' : 'Bài làm'}</h2>
            <span className="metadata">
              {objective
                ? `${answered}/${activity.questions.length} câu đã điền`
                : activity.skill === 'Writing'
                  ? `${wordCount(attempt.draft)} từ`
                  : 'Luyện theo nhịp của bạn'}
            </span>
          </div>
          {objective ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="questions">
                {activity.questions.map((q, i) => {
                  const correct = isCorrect(q, attempt.responses[q.id]);
                  const marked = saved.includes(`${activity.id}@${activity.version}/${q.id}`);
                  return (
                    <fieldset
                      key={q.id}
                      className={`question ${submitted ? (correct ? 'correct' : 'incorrect') : ''}`}
                    >
                      <legend>
                        <span className="question-number">{i + 1}.</span>
                        <span lang="en">{q.prompt}</span>
                      </legend>
                      {q.options ? (
                        <div className="answer-options">
                          {q.options.map(option => (
                            <label key={option}>
                              <input
                                type="radio"
                                name={q.id}
                                value={option}
                                checked={attempt.responses[q.id] === option}
                                disabled={submitted}
                                onChange={() =>
                                  onUpdate({ responses: { ...attempt.responses, [q.id]: option } })
                                }
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          aria-label={`Câu ${i + 1}: ${q.prompt}`}
                          autoComplete="off"
                          spellCheck={false}
                          disabled={submitted}
                          value={attempt.responses[q.id] || ''}
                          onChange={e =>
                            onUpdate({ responses: { ...attempt.responses, [q.id]: e.target.value } })
                          }
                        />
                      )}
                      {submitted && (
                        <div className="answer-review">
                          <p>
                            <strong>
                              {correct ? 'Đúng' : 'Cần xem lại'} · {q.accepted.join(' / ')}
                            </strong>
                          </p>
                          <p>{q.explanation}</p>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => onSave(q.id)}
                            aria-pressed={marked}
                          >
                            <Bookmark size={16} fill={marked ? 'currentColor' : 'none'} />
                            {marked ? 'Đã lưu để ôn' : 'Lưu để ôn'}
                          </button>
                        </div>
                      )}
                    </fieldset>
                  );
                })}
              </div>
              {!submitted && (
                <button className="primary submit" type="submit">
                  Nộp bài <ArrowRight size={19} />
                </button>
              )}
            </form>
          ) : (
            <>
              {activity.skill === 'Speaking' && (
                <>
                  <div className="prep-timer">
                    <span role="timer">
                      {seconds > 0 ? `Chuẩn bị · ${seconds}s` : 'Hết thời gian chuẩn bị. Sẵn sàng nói nhé.'}
                    </span>
                    <button
                      onClick={() => {
                        if (seconds <= 0) setSeconds(60);
                        setPreparing(p => !p);
                      }}
                    >
                      {preparing && seconds > 0
                        ? 'Tạm dừng'
                        : seconds <= 0
                          ? 'Bắt đầu lại'
                          : 'Chuẩn bị 1 phút'}
                    </button>
                  </div>
                  <p className="small">
                    Bộ đếm tùy chọn để luyện ý, không phải thời gian chuẩn bị của bài thi Part 1.
                  </p>
                </>
              )}
              <div className="field-label">
                <label htmlFor="plan">
                  {activity.skill === 'Writing' ? 'Dàn ý của bạn' : 'Vài từ khóa trước khi nói'}
                </label>
                <textarea
                  id="plan"
                  rows={4}
                  disabled={submitted}
                  placeholder="Ý chính, lý do, ví dụ…"
                  value={attempt.plan}
                  onChange={e => onUpdate({ plan: e.target.value })}
                />
              </div>
              {activity.skill === 'Writing' ? (
                <>
                  <div className="field-label">
                    <label htmlFor="draft">Bài viết của bạn</label>
                    <textarea
                      id="draft"
                      className="writing-area"
                      rows={16}
                      lang="en"
                      disabled={submitted}
                      placeholder="Start with one clear sentence…"
                      value={attempt.draft}
                      onChange={e => onUpdate({ draft: e.target.value })}
                    />
                  </div>
                  <div className="draft-tools">
                    <span>
                      {wordCount(attempt.draft)} / {minWords} từ tối thiểu
                    </span>
                    <button
                      disabled={!attempt.draft.trim()}
                      onClick={() =>
                        download(
                          new Blob([attempt.draft], { type: 'text/plain;charset=utf-8' }),
                          `${activity.id}.txt`,
                        )
                      }
                    >
                      <Download size={16} />
                      Tải bài viết
                    </button>
                  </div>
                  {!submitted && (
                    <button
                      className="text-button"
                      disabled={!attempt.draft.trim()}
                      onClick={() =>
                        onUpdate({
                          revisions: [
                            ...attempt.revisions,
                            { text: attempt.draft, date: new Date().toISOString() },
                          ],
                        })
                      }
                    >
                      Giữ một phiên bản ({attempt.revisions.length})
                    </button>
                  )}
                  {attempt.revisions.length > 0 && (
                    <details className="revision-list">
                      <summary>Các phiên bản đã giữ ({attempt.revisions.length})</summary>
                      {[...attempt.revisions].reverse().map((r, i) => (
                        <article key={`${r.date}-${i}`}>
                          <p>
                            {formatDate(r.date)} · {wordCount(r.text)} từ
                          </p>
                          <p className="small">{r.text.slice(0, 140)}…</p>
                          <button
                            disabled={submitted}
                            onClick={() => {
                              if (confirm('Khôi phục phiên bản này? Bản hiện tại sẽ được giữ trong lịch sử.'))
                                onUpdate({
                                  draft: r.text,
                                  revisions: [
                                    ...attempt.revisions,
                                    { text: attempt.draft, date: new Date().toISOString() },
                                  ],
                                });
                            }}
                          >
                            Khôi phục
                          </button>
                        </article>
                      ))}
                    </details>
                  )}
                </>
              ) : (
                <Recorder
                  recording={attempt.recording}
                  disabled={submitted}
                  onChange={recording => onUpdate({ recording })}
                />
              )}
              <section className="checklist">
                <h3>Danh sách tự đánh giá</h3>
                {activity.checklist?.map(item => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      disabled={submitted}
                      checked={attempt.checks.includes(item)}
                      onChange={e =>
                        onUpdate({
                          checks: e.target.checked
                            ? [...attempt.checks, item]
                            : attempt.checks.filter(x => x !== item),
                        })
                      }
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </section>
              {!submitted && (
                <button
                  className="primary submit"
                  onClick={submit}
                  disabled={activity.skill === 'Writing' && !attempt.draft.trim()}
                >
                  Hoàn thành lượt luyện <Check size={18} />
                </button>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
