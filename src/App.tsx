import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Moon,
  Lightbulb,
  Sun,
  ChevronRight,
  History,
  Laptop,
  Layers,
  LibraryBig,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpenText,
  Wrench,
} from 'lucide-react';
import { activities } from './content/activities';
import { emptyData, newAttempt, type Activity, type Attempt, type Skill } from './domain';
import { useStudyData } from './useStudyData';
import { adjustStudyDay, dayKey } from './streak';
import { CourseLoader } from './CourseReader';
import {
  lessonIndex as lessons,
  initialLessonProgress,
  isLessonStage,
  type LessonMeta,
  type LessonStage,
  type LessonProgress,
} from './curriculum';
import { Empty } from './ui';
import { TodayPage } from './pages/TodayPage';
import { CoursesPage } from './pages/CoursesPage';
import { PracticePage } from './pages/PracticePage';
import { ReviewPage } from './pages/ReviewPage';
import { Workspace } from './pages/Workspace';
import { DataSettings } from './pages/DataSettings';
import { OutcomesPage } from './pages/OutcomesPage';
import { MethodsPage } from './pages/MethodsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ToolsPage } from './pages/ToolsPage';
import { GuidePage, guideRoutes } from './pages/GuideTabs';

const getRoute = () => location.hash.slice(1) || 'today';

export default function App() {
  const { data, ready, saveState, storageError, conflict, mutate, reload, dismissConflict } = useStudyData();
  const [route, setRoute] = useState(getRoute);
  const [filter, setFilter] = useState<Skill | 'all'>('all');
  const [query, setQuery] = useState('');
  const [part, setPart] = useState('all');
  const [duration, setDuration] = useState('all');
  const [reviewTab, setReviewTab] = useState<'saved' | 'history'>('saved');
  const [today] = useState(() => new Date());
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('hien.sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  );
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem('hien.theme', next);
    } catch {
      // Not critical; the choice just won't be remembered.
    }
  }
  useEffect(() => {
    // Follow system changes until the viewer picks a theme explicitly.
    const media = matchMedia('(prefers-color-scheme: dark)');
    const follow = () => {
      try {
        if (localStorage.getItem('hien.theme')) return;
      } catch {
        // Fall through and follow the system.
      }
      const next = media.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);
  const toggleSidebar = useCallback(() => {
    setCollapsed(value => {
      try {
        localStorage.setItem('hien.sidebar', value ? 'open' : 'collapsed');
      } catch {
        // Not critical; the choice just won't be remembered.
      }
      return !value;
    });
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSidebar]);
  useEffect(() => {
    const change = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  function updateAttempt(id: string, patch: Partial<Attempt>) {
    mutate(old => {
      const finished =
        patch.status === 'completed' && old.attempts.some(a => a.id === id && a.status !== 'completed');
      return {
        ...old,
        attempts: old.attempts.map(a =>
          a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
        ),
        studyDays: finished ? adjustStudyDay(old.studyDays, dayKey(new Date()), 1) : old.studyDays,
      };
    });
  }
  function go(destination: string) {
    location.hash = destination;
  }
  function openLesson(unit: LessonMeta, stage?: LessonStage) {
    const selected = stage || data.lessons[unit.id]?.stage || 'theory';
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
    mutate(old => {
      const before = old.lessons[id] || initialLessonProgress();
      // Marking a step done counts toward today; unmarking takes one back (never below zero).
      const delta = patch.completed ? patch.completed.length - before.completed.length : 0;
      return {
        ...old,
        lessons: { ...old.lessons, [id]: { ...before, ...patch } },
        studyDays: delta ? adjustStudyDay(old.studyDays, dayKey(new Date()), delta) : old.studyDays,
      };
    });
  }
  function start(activity: Activity, fresh = false) {
    const existing = [...data.attempts]
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
  const section = route.startsWith('attempt')
    ? 'practice'
    : route.startsWith('lesson/')
      ? 'courses'
      : guideRoutes.includes(route)
        ? 'guide'
        : route;
  useEffect(() => {
    // On phones the tab row scrolls; keep the current destination in view,
    // again once web fonts have loaded and widened the labels.
    const reveal = () =>
      document
        .querySelector(`.sidebar nav a[href="#${section}"]`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    reveal();
    void document.fonts?.ready.then(reveal);
  }, [section]);
  const nav = [
    { id: 'guide', label: 'Cẩm nang', Icon: Lightbulb },
    { id: 'today', label: 'Tổng quan', Icon: LayoutDashboard },
    { id: 'courses', label: 'Bài học', Icon: BookOpenText },
    { id: 'practice', label: 'Luyện tập', Icon: LibraryBig },
    { id: 'review', label: 'Ôn lại', Icon: History },
    { id: 'tools', label: 'Công cụ', Icon: Wrench },
  ];

  return (
    <div className={collapsed ? 'app-shell collapsed' : 'app-shell'}>
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
              title={collapsed ? label : undefined}
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
        <button
          className="sidebar-toggle theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          title={collapsed ? (theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối') : undefined}
        >
          {theme === 'dark' ? <Sun size={22} strokeWidth={1.5} /> : <Moon size={22} strokeWidth={1.5} />}
          <span>{theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}</span>
        </button>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          title={`${collapsed ? 'Mở rộng' : 'Thu gọn'} (Ctrl+B)`}
        >
          {collapsed ? (
            <PanelLeftOpen size={22} strokeWidth={1.5} />
          ) : (
            <PanelLeftClose size={22} strokeWidth={1.5} />
          )}
          <span>Thu gọn</span>
        </button>
        <button
          className="device-button"
          onClick={() => go('data')}
          title={collapsed ? saveState : undefined}
        >
          <Laptop size={21} />
          <span>{saveState}</span>
          <ChevronRight size={15} />
        </button>
      </aside>
      <main id="main" tabIndex={-1}>
        {conflict && (
          <div className="storage-error" role="alert">
            <p>Dữ liệu vừa được lưu từ một tab Hiên khác. Chọn bản muốn giữ để tránh ghi đè bài làm.</p>
            <div className="actions">
              <button onClick={reload}>Dùng dữ liệu mới nhất</button>
              <button onClick={dismissConflict}>Giữ bản của tab này</button>
            </div>
          </div>
        )}
        {storageError && (
          <div className="storage-error" role="alert">
            <p>{storageError}</p>
            <div className="actions">
              <button onClick={() => mutate(old => ({ ...old }), { immediate: true })}>Thử lưu lại</button>
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
              <TodayPage
                data={data}
                today={today}
                pending={pending}
                next={next}
                nextLesson={nextLesson}
                start={start}
                openLesson={openLesson}
                setFilter={setFilter}
                setPart={setPart}
                setReviewTab={setReviewTab}
                go={go}
                setGoal={goal => mutate(old => ({ ...old, dailyGoal: goal }))}
              />
            )}
            {route === 'courses' && (
              <CoursesPage data={data} filter={filter} setFilter={setFilter} openLesson={openLesson} />
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
              <PracticePage
                data={data}
                filter={filter}
                setFilter={setFilter}
                part={part}
                setPart={setPart}
                query={query}
                setQuery={setQuery}
                duration={duration}
                setDuration={setDuration}
                start={start}
                go={go}
              />
            )}
            {route === 'review' && (
              <ReviewPage
                data={data}
                reviewTab={reviewTab}
                setReviewTab={setReviewTab}
                start={start}
                mutate={mutate}
                go={go}
              />
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
            {route === 'guide' && <GuidePage />}
            {route === 'outcomes' && <OutcomesPage />}
            {route === 'methods' && <MethodsPage />}
            {route === 'resources' && <ResourcesPage />}
            {route === 'tools' && <ToolsPage />}
            {route === 'data' && (
              <DataSettings
                data={data}
                onImport={value => mutate(() => value, { immediate: true })}
                onClear={() => mutate(emptyData, { immediate: true })}
              />
            )}
            {!['today', 'courses', 'practice', 'review', 'tools', 'data', ...guideRoutes].includes(route) &&
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
