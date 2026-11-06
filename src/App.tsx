import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  Headphones,
  Home,
  Layers,
  Laptop,
  MessageCircle,
  PenLine,
  RotateCcw,
  Search,
  Settings2,
  Timer,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { activities, skills } from './content/activities';
import {
  emptyData,
  isCorrect,
  newAttempt,
  score,
  wordCount,
  type Activity,
  type Attempt,
  type Skill,
  type StudyData,
} from './domain';
import { download, readData, validateData, writeData } from './storage';
import { Recorder } from './Recorder';
import { CourseLoader } from './CourseReader';
import {
  lessonIndex as lessons,
  initialLessonProgress,
  isLessonStage,
  stages,
  stageLabels,
  type LessonMeta,
  type LessonStage,
  type LessonProgress,
} from './curriculum';

const icons = { Listening: Headphones, Speaking: MessageCircle, Reading: BookOpen, Writing: PenLine };
const skillDescriptions = {
  Listening: 'Điền thông tin và phân biệt đáp án gây nhiễu.',
  Speaking: 'Phát triển câu trả lời, ghi âm và tự đánh giá.',
  Reading: 'Đọc hiểu và đối chiếu bằng chứng.',
  Writing: 'Lập dàn ý, viết bài và so sánh bài mẫu.',
};
const getRoute = () => location.hash.slice(1) || 'today';
const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', timeZone: 'Asia/Bangkok' }).format(
    new Date(date),
  );

export default function App() {
  const [data, setData] = useState<StudyData>(emptyData);
  const currentData = useRef(data);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState('Đang tải dữ liệu…');
  const [storageError, setStorageError] = useState('');
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const [route, setRoute] = useState(getRoute);
  const [filter, setFilter] = useState<Skill | 'all'>('all');
  const [query, setQuery] = useState('');
  const [part, setPart] = useState('all');
  const [duration, setDuration] = useState('all');
  const [reviewTab, setReviewTab] = useState<'saved' | 'history'>('saved');
  useEffect(() => {
    let active = true;
    readData()
      .then(value => {
        if (active) {
          currentData.current = value;
          setData(value);
          setSaveState('Đã lưu trên thiết bị này');
        }
      })
      .catch(() => {
        if (active) {
          setStorageError(
            'Không mở được bộ nhớ trình duyệt. Bạn vẫn có thể luyện, nhưng hãy xuất dữ liệu trước khi rời trang.',
          );
          setSaveState('Chưa lưu được');
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    const change = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', change);
    return () => {
      active = false;
      window.removeEventListener('hashchange', change);
    };
  }, []);
  function mutate(update: (old: StudyData) => StudyData) {
    const next = update(currentData.current);
    currentData.current = next;
    setData(next);
    setSaveState('Đang lưu…');
    const latest = ++revision.current;
    queue.current = queue.current
      .catch(() => undefined)
      .then(() => writeData(next))
      .then(() => {
        if (latest === revision.current) {
          setSaveState('Đã lưu trên thiết bị này');
          setStorageError('');
        }
      })
      .catch(() => {
        if (latest === revision.current) {
          setSaveState('Chưa lưu được');
          setStorageError(
            'Chưa lưu được thay đổi. Có thể bộ nhớ đã đầy. Xuất dữ liệu để giữ bài, rồi thử lưu lại.',
          );
        }
      });
  }
  function updateAttempt(id: string, patch: Partial<Attempt>) {
    mutate(old => ({
      ...old,
      attempts: old.attempts.map(a =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
      ),
    }));
  }
  function go(destination: string) {
    location.hash = destination;
  }
  function openLesson(unit: LessonMeta, stage?: LessonStage) {
    const selected = stage || currentData.current.lessons[unit.id]?.stage || 'theory';
    mutate(old => ({
      ...old,
      lessons: {
        ...old.lessons,
        [unit.id]: { ...(old.lessons[unit.id] || initialLessonProgress()), stage: selected },
      },
    }));
    go(`lesson/${unit.id}/${selected}`);
  }
  function updateLesson(id: string, patch: Partial<LessonProgress>) {
    mutate(old => ({
      ...old,
      lessons: { ...old.lessons, [id]: { ...(old.lessons[id] || initialLessonProgress()), ...patch } },
    }));
  }
  function start(activity: Activity, fresh = false) {
    const existing = [...currentData.current.attempts]
      .reverse()
      .find(a => a.activityId === activity.id && a.version === activity.version && a.status === 'draft');
    if (!fresh && existing) {
      go(`attempt/${existing.id}`);
      return;
    }
    const attempt = newAttempt(activity);
    mutate(old => ({ ...old, attempts: [...old.attempts, attempt] }));
    go(`attempt/${attempt.id}`);
  }
  function toggleSaved(activity: Activity, questionId: string) {
    const key = `${activity.id}@${activity.version}/${questionId}`;
    mutate(old => ({
      ...old,
      saved: old.saved.includes(key) ? old.saved.filter(s => s !== key) : [...old.saved, key],
    }));
  }
  const pending = [...data.attempts]
    .reverse()
    .find(
      a =>
        a.status === 'draft' &&
        activities.some(activity => activity.id === a.activityId && activity.version === a.version),
    );
  const next =
    activities.find(a => a.id === pending?.activityId) ||
    activities.find(a => data.saved.some(s => s.startsWith(`${a.id}@${a.version}/`))) ||
    activities.find(
      a => !data.attempts.some(attempt => attempt.activityId === a.id && attempt.status === 'completed'),
    ) ||
    activities[0];
  const attempt = data.attempts.find(a => route === `attempt/${a.id}`);
  const activity = activities.find(a => a.id === attempt?.activityId && a.version === attempt.version);
  const nextLesson = lessons.find(unit => unit.linkedActivities.includes(next.id)) || lessons[0];
  const unit = lessons.find(lesson => route.startsWith(`lesson/${lesson.id}/`));
  const requestedStage = route.split('/')[2] || '';
  const lessonStage = isLessonStage(requestedStage) ? requestedStage : 'theory';
  const section = route.startsWith('attempt') ? 'practice' : route.startsWith('lesson/') ? 'courses' : route;
  const nav = [
    { id: 'today', label: 'Hôm nay', Icon: Home },
    { id: 'courses', label: 'Bài học', Icon: Layers },
    { id: 'practice', label: 'Luyện tập', Icon: BookOpen },
    { id: 'review', label: 'Ôn lại', Icon: RotateCcw },
  ];

  return (
    <div className="app-shell">
      <a
        className="skip"
        href="#main"
        onClick={event => {
          event.preventDefault();
          document.getElementById('main')?.focus();
          document.getElementById('main')?.scrollIntoView();
        }}
      >
        Đến nội dung chính
      </a>
      <aside className="sidebar">
        <a className="wordmark" href="#today" aria-label="Hiên — về Hôm nay">
          <span className="brand-mark">
            <Layers size={23} strokeWidth={1.8} />
          </span>
          <span>
            Hiên<small>English practice</small>
          </span>
        </a>
        <nav aria-label="Điều hướng chính">
          {nav.map(({ id, label, Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={section === id ? 'active' : ''}
              aria-current={section === id ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>IELTS Academic</strong>
          <span>
            Luyện theo kỹ năng.
            <br />
            Theo dõi bài đã làm.
          </span>
        </div>
        <button className="device-button" onClick={() => go('data')}>
          <Laptop size={21} />
          <span>{saveState}</span>
          <ChevronRight size={15} />
        </button>
      </aside>
      <main id="main" tabIndex={-1}>
        {storageError && (
          <div className="storage-error" role="alert">
            <p>{storageError}</p>
            <div className="actions">
              <button onClick={() => mutate(old => ({ ...old }))}>Thử lưu lại</button>
              <button onClick={() => go('data')}>Xuất dữ liệu</button>
            </div>
          </div>
        )}
        {!ready ? (
          <div className="empty" role="status">
            <Layers />
            <h1>Đang tải dữ liệu học…</h1>
          </div>
        ) : (
          <>
            {route === 'today' && (
              <>
                <header className="daily-heading">
                  <div>
                    <h1>Tổng quan học tập</h1>
                    <p>Chọn bài luyện, kiểm tra kết quả và xử lý điểm yếu.</p>
                  </div>
                  <span className="date">
                    {new Intl.DateTimeFormat('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'Asia/Bangkok',
                    }).format(new Date())}
                  </span>
                </header>
                <div className="daily-grid">
                  <div>
                    <section className="feature">
                      <div className="feature-copy">
                        <h2>{pending ? next.title : `${nextLesson.skill} · ${nextLesson.part}`}</h2>
                        <div className="feature-meta">
                          <span className="part-label">
                            {next.skill} / {next.part}
                          </span>
                          <span>
                            <Timer size={15} />
                            {pending ? `${next.minutes} phút` : '5 bước học'}
                          </span>
                          <span className="resume-state">
                            {pending ? 'Bản nháp bài luyện' : 'Bắt đầu từ lý thuyết'}
                          </span>
                        </div>
                        <p className="feature-description">
                          {pending
                            ? next.description
                            : 'Học nội dung gốc, xem cách làm, luyện bài nhỏ rồi chuyển sang bài đầy đủ.'}
                        </p>
                        <button
                          className="primary"
                          onClick={() => (pending ? start(next) : openLesson(nextLesson))}
                        >
                          {pending ? 'Học tiếp' : 'Bắt đầu học'}
                          <ArrowRight size={18} />
                        </button>
                      </div>
                      <ol className="session-flow" aria-label="Quy trình học">
                        {stages.map((step, i) => (
                          <li key={step}>
                            <span>{i + 1}</span>
                            <div>
                              <strong>{stageLabels[step]}</strong>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </section>
                    <section className="skill-index" aria-label="Bốn kỹ năng">
                      <div className="section-heading">
                        <h2>Học theo kỹ năng</h2>
                        <span>{lessons.length} bài học</span>
                      </div>
                      {skills.map(skill => {
                        const Icon = icons[skill];
                        return (
                          <button
                            key={skill}
                            onClick={() => {
                              setFilter(skill);
                              setPart('all');
                              go('courses');
                            }}
                          >
                            <Icon size={25} strokeWidth={1.6} />
                            <span>
                              <strong>{skill}</strong>
                              <span>{skillDescriptions[skill]}</span>
                            </span>
                            <span className="skill-count">
                              {lessons.filter(a => a.skill === skill).length} bài học
                            </span>
                            <ArrowRight size={18} />
                          </button>
                        );
                      })}
                    </section>
                  </div>
                  <aside className="daily-margin">
                    <section className="study-summary">
                      <h2>Tiến độ của bạn</h2>
                      <dl>
                        <div>
                          <dt>Lượt đã hoàn thành</dt>
                          <dd>{data.attempts.filter(a => a.status === 'completed').length}</dd>
                        </div>
                        <div>
                          <dt>Bài đang học</dt>
                          <dd>{data.attempts.filter(a => a.status === 'draft').length}</dd>
                        </div>
                        <div>
                          <dt>Câu đã lưu để ôn</dt>
                          <dd>{data.saved.length}</dd>
                        </div>
                      </dl>
                      <button
                        className="text-button"
                        onClick={() => {
                          setReviewTab('history');
                          go('review');
                        }}
                      >
                        Xem lịch sử học
                        <ArrowRight size={17} />
                      </button>
                    </section>
                    <section className="reading-preview">
                      <h2>Bài luyện nhanh</h2>
                      <p className="metadata">Reading · True / False / Not Given · 5 phút</p>
                      <blockquote lang="en">
                        The museum opened in 2004 and began offering free entry in 2010.
                      </blockquote>
                      <p>
                        “Admission was free from the first day.”
                        <br />
                        Đối chiếu nhận định với thông tin trong đoạn văn.
                      </p>
                      <button className="text-button" onClick={() => start(activities[2])}>
                        Làm bài Reading <ArrowRight size={17} />
                      </button>
                    </section>
                  </aside>
                </div>
                <footer>
                  Hiên · Luyện tập độc lập, không liên kết với IELTS.{' '}
                  <span>Dữ liệu được lưu trên thiết bị này.</span>
                </footer>
              </>
            )}
            {route === 'courses' && (
              <>
                <PageTitle
                  title="Bài học theo lộ trình"
                  description="Lý thuyết → Hướng dẫn làm bài → Bài tập nhỏ → Bài tập đầy đủ → Đáp án & xem lại."
                />
                <div className="skill-tabs" aria-label="Lọc bài học">
                  {(['all', ...skills] as const).map(skill => (
                    <button
                      key={skill}
                      className={filter === skill ? 'selected' : ''}
                      aria-pressed={filter === skill}
                      onClick={() => setFilter(skill)}
                    >
                      {skill === 'all' ? 'Tất cả' : skill}
                    </button>
                  ))}
                </div>
                <p className="library-note">
                  {lessons.length} bài học từ 7 tài liệu kỹ năng. Reading có đủ các dạng trong tài liệu hiện
                  tại; nguồn bài dài vẫn cần bổ sung. Bài tập nhập theo nội dung gốc dùng ô bài làm và tự đối
                  chiếu; 6 workspace hiện có hỗ trợ luyện riêng.
                </p>
                <div className="activity-list">
                  {lessons
                    .filter(lesson => filter === 'all' || lesson.skill === filter)
                    .map(lesson => {
                      const Icon = icons[lesson.skill];
                      const progress = data.lessons[lesson.id];
                      return (
                        <button className="activity-row" key={lesson.id} onClick={() => openLesson(lesson)}>
                          <Icon size={29} />
                          <div>
                            <h2>
                              {lesson.skill} · {lesson.part}
                            </h2>
                            <p>{lesson.title}</p>
                            <span className="metadata">
                              5 bước · {progress?.completed.length || 0}/5 đã đánh dấu học xong
                            </span>
                          </div>
                          <span className="row-end">
                            {progress ? 'Học tiếp' : 'Mở bài học'}
                            <ArrowRight size={18} />
                          </span>
                        </button>
                      );
                    })}
                </div>
              </>
            )}
            {route.startsWith('lesson/') && unit && (
              <CourseLoader
                key={`${unit.id}/${lessonStage}`}
                unit={unit}
                stage={lessonStage}
                progress={data.lessons[unit.id] || initialLessonProgress()}
                saveState={saveState}
                onChange={patch => updateLesson(unit.id, patch)}
                onNavigate={stage => openLesson(unit, stage)}
                onBack={() => go('courses')}
                onPractice={id => {
                  const selected = activities.find(a => a.id === id);
                  if (selected) start(selected);
                }}
              />
            )}
            {route.startsWith('lesson/') && !unit && (
              <Empty
                title="Không tìm thấy bài học."
                text="Chọn lại bài học từ danh sách."
                onClick={() => go('courses')}
              />
            )}
            {route === 'practice' && (
              <>
                <PageTitle
                  title="Thư viện bài luyện"
                  description="Lọc theo kỹ năng, dạng bài và thời lượng."
                />
                <button className="text-button" onClick={() => go('courses')}>
                  Học lý thuyết, hướng dẫn và bài tập theo lộ trình
                  <ArrowRight size={17} />
                </button>
                <div className="filters">
                  <div className="skill-tabs" aria-label="Lọc kỹ năng">
                    {(['all', ...skills] as const).map(skill => (
                      <button
                        className={filter === skill ? 'selected' : ''}
                        key={skill}
                        onClick={() => {
                          setFilter(skill);
                          setPart('all');
                        }}
                        aria-pressed={filter === skill}
                      >
                        {skill === 'all' ? 'Tất cả' : skill}
                      </button>
                    ))}
                  </div>
                  <label className="search">
                    <Search size={18} />
                    <input
                      aria-label="Tìm bài luyện"
                      placeholder="Tìm chủ đề, kỹ thuật…"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                  </label>
                  <div className="select-filters">
                    <label>
                      Phần{' '}
                      <select value={part} onChange={e => setPart(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {[
                          ...new Set(
                            activities.filter(a => filter === 'all' || a.skill === filter).map(a => a.part),
                          ),
                        ].map(p => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Thời lượng{' '}
                      <select value={duration} onChange={e => setDuration(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="short">Tối đa 10 phút</option>
                        <option value="medium">11–20 phút</option>
                        <option value="long">Trên 20 phút</option>
                      </select>
                    </label>
                  </div>
                </div>
                <p className="library-note">
                  Bộ khởi đầu · 6 bài luyện từ tài liệu của bạn. Reading hiện có hai bài ngắn; bài dài sẽ được
                  thêm sau.
                </p>
                <div className="activity-list">
                  {activities
                    .filter(
                      a =>
                        (filter === 'all' || a.skill === filter) &&
                        (part === 'all' || part === a.part) &&
                        (duration === 'all' ||
                          (duration === 'short'
                            ? a.minutes <= 10
                            : duration === 'medium'
                              ? a.minutes > 10 && a.minutes <= 20
                              : a.minutes > 20)) &&
                        `${a.title} ${a.description} ${a.technique} ${a.skill}`
                          .toLocaleLowerCase('vi')
                          .includes(query.toLocaleLowerCase('vi')),
                    )
                    .map(a => (
                      <ActivityRow
                        key={a.id}
                        activity={a}
                        onClick={() => start(a)}
                        completed={data.attempts.some(
                          at => at.activityId === a.id && at.status === 'completed',
                        )}
                      />
                    ))}
                  {!activities.some(
                    a =>
                      (filter === 'all' || a.skill === filter) &&
                      (part === 'all' || part === a.part) &&
                      (duration === 'all' ||
                        (duration === 'short'
                          ? a.minutes <= 10
                          : duration === 'medium'
                            ? a.minutes > 10 && a.minutes <= 20
                            : a.minutes > 20)) &&
                      `${a.title} ${a.description} ${a.technique} ${a.skill}`
                        .toLocaleLowerCase('vi')
                        .includes(query.toLocaleLowerCase('vi')),
                  ) && (
                    <div className="empty">
                      <Search />
                      <h2>Chưa tìm thấy bài phù hợp.</h2>
                      <p>Thử một từ khóa khác hoặc bỏ bộ lọc.</p>
                      <button
                        onClick={() => {
                          setFilter('all');
                          setQuery('');
                          setPart('all');
                          setDuration('all');
                        }}
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {route === 'review' && (
              <>
                <PageTitle
                  title="Ôn tập & lịch sử"
                  description="Xem lại câu đã lưu, tiếp tục bản nháp hoặc kiểm tra bài đã làm."
                />
                <div className="skill-tabs">
                  <button
                    className={reviewTab === 'saved' ? 'selected' : ''}
                    aria-pressed={reviewTab === 'saved'}
                    onClick={() => setReviewTab('saved')}
                  >
                    Câu đã lưu ({data.saved.length})
                  </button>
                  <button
                    className={reviewTab === 'history' ? 'selected' : ''}
                    aria-pressed={reviewTab === 'history'}
                    onClick={() => setReviewTab('history')}
                  >
                    Nhật ký học ({data.attempts.length})
                  </button>
                </div>
                {reviewTab === 'saved' ? (
                  <>
                    {data.saved.length ? (
                      data.saved.map(key => {
                        const [ref, questionId] = key.split('/');
                        const a = activities.find(x => `${x.id}@${x.version}` === ref);
                        const q = a?.questions.find(x => x.id === questionId);
                        return (
                          <article className="saved-question" key={key}>
                            <p className="metadata">
                              {a?.skill || ref} · {a?.title || 'Phiên bản nội dung cũ'}
                            </p>
                            <h2>{q?.prompt || 'Câu hỏi không có trong phiên bản hiện tại.'}</h2>
                            {q && (
                              <>
                                <p>
                                  <strong>{q.accepted.join(' / ')}</strong> — {q.explanation}
                                </p>
                                <button className="text-button" onClick={() => a && start(a, true)}>
                                  Luyện lại bài <ArrowRight size={18} />
                                </button>
                              </>
                            )}
                            <button
                              className="text-button muted"
                              onClick={() =>
                                mutate(old => ({ ...old, saved: old.saved.filter(s => s !== key) }))
                              }
                            >
                              <X size={16} />
                              Bỏ lưu
                            </button>
                          </article>
                        );
                      })
                    ) : (
                      <Empty
                        title="Chưa có câu nào cần ôn."
                        text="Sau mỗi bài, lưu những câu bạn muốn quay lại. Sổ ôn sẽ nằm ở đây."
                        onClick={() => go('practice')}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {data.attempts.length ? (
                      <div className="history">
                        {[...data.attempts].reverse().map(a => {
                          const lesson = activities.find(
                            x => x.id === a.activityId && x.version === a.version,
                          );
                          return (
                            <article key={a.id}>
                              <div>
                                <p className="metadata">
                                  {formatDate(a.updatedAt)} ·{' '}
                                  {a.status === 'draft' ? 'Đang học' : 'Đã hoàn thành'}
                                  {a.revealed ? ' · Đã xem gợi ý/mẫu' : ''}
                                </p>
                                <h2>{lesson?.title || `${a.activityId} · phiên bản ${a.version}`}</h2>
                                <p>
                                  {lesson?.questions.length && a.status === 'completed'
                                    ? `${a.score ?? 0}/${lesson.questions.length} câu đúng`
                                    : a.status === 'completed'
                                      ? 'Tự đánh giá'
                                      : 'Bản nháp được giữ lại'}
                                </p>
                              </div>
                              <div className="actions">
                                {lesson && (
                                  <button onClick={() => go(`attempt/${a.id}`)}>
                                    {a.status === 'draft' ? 'Học tiếp' : 'Xem lại'}
                                    <ArrowRight size={17} />
                                  </button>
                                )}
                                <button
                                  aria-label={`Xóa lượt học ${lesson?.title || a.id}`}
                                  onClick={() => {
                                    if (confirm('Xóa lượt học và bản ghi âm đi kèm?'))
                                      mutate(old => ({
                                        ...old,
                                        attempts: old.attempts.filter(x => x.id !== a.id),
                                      }));
                                  }}
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <Empty
                        title="Chưa có lịch sử học"
                        text="Bắt đầu một bài luyện. Mọi bản nháp và lượt học sẽ xuất hiện ở đây."
                        onClick={() => go('practice')}
                      />
                    )}
                  </>
                )}
              </>
            )}
            {attempt && activity && (
              <Workspace
                key={attempt.id}
                activity={activity}
                attempt={attempt}
                saved={data.saved}
                saveState={saveState}
                onUpdate={patch => updateAttempt(attempt.id, patch)}
                onSave={id => toggleSaved(activity, id)}
                onRetry={() => start(activity, true)}
                onBack={() => go('practice')}
              />
            )}
            {route.startsWith('attempt/') && (!attempt || !activity) && (
              <Empty
                title="Không mở được lượt học này."
                text="Lượt học có thể đã bị xóa hoặc dùng phiên bản nội dung cũ. Bạn vẫn có thể xuất dữ liệu trong phần Thiết bị."
                onClick={() => go('review')}
              />
            )}
            {route === 'data' && (
              <DataSettings
                data={data}
                onImport={value => mutate(() => value)}
                onClear={() => mutate(emptyData)}
              />
            )}
            {!['today', 'courses', 'practice', 'review', 'data'].includes(route) &&
              !route.startsWith('attempt/') &&
              !route.startsWith('lesson/') && (
                <Empty
                  title="Trang này chưa có."
                  text="Mở lại trang tổng quan."
                  onClick={() => go('today')}
                />
              )}
          </>
        )}
      </main>
    </div>
  );
}

function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
function Empty({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
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
function ActivityRow({
  activity,
  onClick,
  completed,
}: {
  activity: Activity;
  onClick: () => void;
  completed: boolean;
}) {
  const Icon = icons[activity.skill];
  return (
    <button className="activity-row" onClick={onClick}>
      <Icon size={31} strokeWidth={1.4} />
      <div>
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>
        <span className="metadata">
          {activity.skill} · {activity.part} · {activity.technique}
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

function Workspace({
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
              {activity.skill === 'Listening'
                ? 'Westlake Sports Club'
                : activity.skill === 'Reading'
                  ? 'Đọc và tìm bằng chứng.'
                  : 'Đề luyện tập'}
            </h2>
            <p className="instructions" lang="en">
              {activity.instructions}
            </p>
            {activity.audio && (
              <>
                <audio
                  key={audioKey}
                  aria-label="Audio bài nghe Westlake"
                  controls
                  preload="metadata"
                  src={activity.audio}
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
                <img
                  className="task-image"
                  src={activity.image}
                  alt="Line graph: annual income in pounds of Bernie’s Buns, Lovely Loaves and Robbie’s Bakery, 2000–2010. Open the image to inspect values."
                />
                <figcaption>
                  <a href={activity.image} target="_blank" rel="noreferrer">
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

function DataSettings({
  data,
  onImport,
  onClear,
}: {
  data: StudyData;
  onImport: (data: StudyData) => void;
  onClear: () => void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function exportBackup() {
    setBusy(true);
    setMessage('');
    try {
      const attempts = await Promise.all(
        data.attempts.map(async attempt => {
          const { recording, ...rest } = attempt;
          const base64 = recording
            ? await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(recording);
              })
            : undefined;
          return { ...rest, ...(base64 ? { recordingData: base64 } : {}) };
        }),
      );
      download(
        new Blob([JSON.stringify({ schema: 1, saved: data.saved, attempts, lessons: data.lessons })], {
          type: 'application/json',
        }),
        `hien-backup-${new Date().toISOString().slice(0, 10)}.json`,
      );
      setMessage('Đã tạo tệp sao lưu, gồm cả bản ghi âm. Giữ tệp ở nơi riêng tư.');
    } catch {
      setMessage('Chưa xuất được dữ liệu. Hãy thử lại.');
    } finally {
      setBusy(false);
    }
  }
  async function importBackup(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('Tệp lớn hơn 100 MB.');
      const raw: unknown = JSON.parse(await file.text());
      const validated = validateData(raw);
      // Recording data is decoded only after the rest of the backup validates.
      const rawAttempts: unknown[] =
        raw && typeof raw === 'object' && 'attempts' in raw && Array.isArray(raw.attempts)
          ? raw.attempts
          : [];
      validated.attempts.forEach((attempt, index) => {
        const item = rawAttempts[index];
        if (item && typeof item === 'object' && 'recordingData' in item) {
          if (typeof item.recordingData !== 'string') throw new Error('Dữ liệu ghi âm không hợp lệ.');
          const match = /^data:(audio\/[\w.+-]+(?:;codecs=[\w.+-]+)?);base64,([A-Za-z0-9+/]*={0,2})$/.exec(
            item.recordingData,
          );
          if (!match) throw new Error('Định dạng ghi âm không hợp lệ.');
          const decoded = atob(match[2]);
          attempt.recording = new Blob([Uint8Array.from(decoded, c => c.charCodeAt(0))], { type: match[1] });
        }
      });
      if (
        !confirm('Nhập tệp sẽ thay thế toàn bộ dữ liệu học trên thiết bị này. Đã sao lưu dữ liệu hiện tại?')
      )
        return;
      onImport(validated);
      setMessage('Đã đọc tệp. Kiểm tra trạng thái lưu ở thanh điều hướng trước khi rời trang.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không đọc được tệp.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="Dữ liệu học tập"
        description="Bài làm và bản ghi nằm trong trình duyệt này. Bạn giữ quyền kiểm soát."
      />
      <section className="data-settings">
        <Settings2 size={30} strokeWidth={1.2} />
        <h2>Sao lưu & khôi phục</h2>
        <p>
          Hiên chưa có tài khoản hay đồng bộ. Xóa dữ liệu trình duyệt có thể làm mất bài. Xuất tệp định kỳ để
          sao lưu hoặc chuyển sang thiết bị khác.
        </p>
        <p>
          {data.attempts.length} lượt học · {data.saved.length} câu đã lưu ·{' '}
          {data.attempts.filter(a => a.recording).length} bản ghi âm
        </p>
        <div className="actions">
          <button className="primary" onClick={exportBackup} disabled={busy}>
            <Download size={18} />
            Xuất toàn bộ dữ liệu
          </button>
          <label className={`file-button ${busy ? 'disabled' : ''}`}>
            <Upload size={18} />
            Nhập tệp sao lưu
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={e => {
                void importBackup(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <div className="danger-zone">
          <h3>Xóa dữ liệu trên thiết bị này</h3>
          <p>Thao tác xóa toàn bộ lượt học, bản nháp, câu đã lưu và bản ghi âm trong Hiên.</p>
          <button
            disabled={busy}
            onClick={() => {
              if (confirm('Xóa toàn bộ dữ liệu Hiên trên thiết bị này? Thao tác không thể hoàn tác.')) {
                onClear();
                setMessage('Đã yêu cầu xóa. Kiểm tra trạng thái lưu trước khi rời trang.');
              }
            }}
          >
            <Trash2 size={18} />
            Xóa dữ liệu
          </button>
        </div>
      </section>
    </>
  );
}
