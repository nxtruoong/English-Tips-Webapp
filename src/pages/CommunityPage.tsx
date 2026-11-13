import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Flag, MessageCircle, RotateCw, Search, Send, Trash2, Users } from 'lucide-react';
import {
  categories,
  LIMITS,
  loadBoard,
  offline,
  sendAction,
  timeAgo,
  type Board,
  type Category,
  type CommunityAction,
  type Reply,
} from '../community';
import { PageTitle } from '../ui';

const PAGE = 20;

/** A text value kept in localStorage so drafts and the name survive a reload. */
function useStored(key: string) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  });
  const save = useCallback(
    (next: string) => {
      setValue(next);
      try {
        if (next) localStorage.setItem(key, next);
        else localStorage.removeItem(key);
      } catch {
        // Not critical; the draft just won't survive a reload.
      }
    },
    [key],
  );
  return [value, save] as const;
}

const validName = (name: string) =>
  name.trim().length >= LIMITS.nameMin && name.trim().length <= LIMITS.nameMax;

function NameField({ name, setName }: { name: string; setName: (name: string) => void }) {
  const [editing, setEditing] = useState(!validName(name));
  if (!editing) {
    return (
      <p className="community-as">
        Đăng với tên <strong>{name.trim()}</strong>
        <button type="button" className="link-button" onClick={() => setEditing(true)}>
          Đổi
        </button>
      </p>
    );
  }
  return (
    <label className="community-name">
      Tên hiển thị
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={() => validName(name) && setEditing(false)}
        maxLength={LIMITS.nameMax}
        placeholder="Ví dụ: Minh Anh"
        autoComplete="nickname"
      />
    </label>
  );
}

export function CommunityPage({ threadId }: { threadId?: string }) {
  const [board, setBoard] = useState<Board>({ threads: [], viewerId: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [name, setName] = useStored('hien.community.nickname');
  const [title, setTitle] = useStored('hien.community.title');
  const [body, setBody] = useStored('hien.community.body');
  const [reply, setReply] = useStored(`hien.community.reply.${threadId || ''}`);
  const [category, setCategory] = useState<Category>('questions');
  const [writing, setWriting] = useState(() => Boolean(title || body));
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [confirming, setConfirming] = useState('');
  const alive = useRef(true);
  const heading = useRef<HTMLHeadingElement>(null);

  // spinner: show the loading state; report: surface a failure (background refreshes stay silent).
  const refresh = useCallback(async (spinner = true, report = true) => {
    if (spinner) setLoading(true);
    try {
      const next = await loadBoard();
      if (!alive.current) return;
      setBoard(next);
      setError('');
    } catch (e) {
      if (alive.current && report) setError((e as Error).message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    loadBoard()
      .then(next => alive.current && setBoard(next))
      .catch(e => alive.current && setError((e as Error).message))
      .finally(() => alive.current && setLoading(false));
    // Pick up new posts when the learner comes back to the tab.
    const onFocus = () => void refresh(false, false);
    window.addEventListener('focus', onFocus);
    return () => {
      alive.current = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const thread = board.threads.find(t => t.id === threadId);
  useEffect(() => {
    if (thread?.id) heading.current?.focus();
  }, [thread?.id]);

  async function submit(action: CommunityAction, done?: (id?: string) => void) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await sendAction(action);
      if (!alive.current) return;
      done?.(result.id);
      if (action.action === 'report') setNotice('Đã báo cáo. Cảm ơn bạn.');
      if (action.action === 'delete') setNotice('Đã xóa.');
      await refresh(false, false);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }

  function post(event: FormEvent) {
    event.preventDefault();
    void submit(
      { action: 'thread', nickname: name.trim(), title: title.trim(), body: body.trim(), category },
      id => {
        setTitle('');
        setBody('');
        setWriting(false);
        if (id) location.hash = `community/${id}`;
      },
    );
  }

  function answer(event: FormEvent) {
    event.preventDefault();
    if (!threadId) return;
    void submit({ action: 'reply', nickname: name.trim(), threadId, body: reply.trim() }, () => setReply(''));
  }

  function tools(item: Reply, replyId?: string) {
    if (!threadId) return null;
    if (item.owner !== board.viewerId) {
      return (
        <button
          type="button"
          className="link-button muted"
          disabled={busy}
          onClick={() => void submit({ action: 'report', threadId, replyId })}
        >
          <Flag size={14} /> Báo cáo
        </button>
      );
    }
    if (confirming === item.id) {
      return (
        <span className="community-confirm">
          {replyId ? 'Xóa trả lời này?' : 'Xóa bài và các trả lời?'}
          <button
            type="button"
            className="link-button danger"
            disabled={busy}
            onClick={() =>
              void submit({ action: 'delete', threadId, replyId }, () => {
                setConfirming('');
                if (!replyId) location.hash = 'community';
              })
            }
          >
            Xóa
          </button>
          <button type="button" className="link-button" onClick={() => setConfirming('')}>
            Không
          </button>
        </span>
      );
    }
    return (
      <button
        type="button"
        className="link-button muted"
        disabled={busy}
        onClick={() => setConfirming(item.id)}
      >
        <Trash2 size={14} /> Xóa
      </button>
    );
  }

  const needle = query.trim().toLocaleLowerCase('vi');
  const visible = board.threads.filter(
    t =>
      (filter === 'all' || t.category === filter) &&
      `${t.title} ${t.body} ${t.nickname}`.toLocaleLowerCase('vi').includes(needle),
  );
  const ready = !loading && Boolean(board.viewerId);
  const canSend = validName(name) && ready && !busy;

  const status = (
    <>
      {error && (
        <div className="community-error" role="alert">
          <span>{error}</span>
          <button type="button" disabled={loading} onClick={() => void refresh()}>
            Thử lại
          </button>
        </div>
      )}
      {notice && (
        <p className="community-notice" role="status">
          {notice}
        </p>
      )}
    </>
  );

  if (threadId) {
    return (
      <section className="community" aria-busy={loading || busy}>
        <a className="community-back" href="#community">
          <ArrowLeft size={17} /> Cộng đồng
        </a>
        {status}
        {loading && !thread && <p role="status">Đang tải…</p>}
        {ready && !thread && <p>Bài này đã bị xóa hoặc không còn nữa.</p>}
        {thread && (
          <>
            <article className="community-post">
              <span className={`community-tag ${thread.category}`}>{categories[thread.category]}</span>
              <h1 ref={heading} tabIndex={-1}>
                {thread.title}
              </h1>
              <p className="community-by">
                <strong>{thread.nickname}</strong>
                {thread.owner === board.viewerId && ' (bạn)'} ·{' '}
                <time dateTime={thread.createdAt}>{timeAgo(thread.createdAt)}</time>
              </p>
              <p className="community-text">{thread.body}</p>
              <div className="community-tools">{tools(thread)}</div>
            </article>

            <h2 className="community-count">
              {thread.replies.length ? `${thread.replies.length} trả lời` : 'Chưa có trả lời'}
            </h2>
            <ol className="community-replies">
              {thread.replies.map(item => (
                <li key={item.id}>
                  <p className="community-by">
                    <strong>{item.nickname}</strong>
                    {item.owner === board.viewerId && ' (bạn)'} ·{' '}
                    <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                  </p>
                  <p className="community-text">{item.body}</p>
                  <div className="community-tools">{tools(item, item.id)}</div>
                </li>
              ))}
            </ol>

            <form className="community-form" onSubmit={answer}>
              <label>
                <span className="visually-hidden">Trả lời</span>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  required
                  maxLength={LIMITS.body}
                  rows={3}
                  placeholder="Viết trả lời…"
                />
              </label>
              <div className="community-form-end">
                <NameField name={name} setName={setName} />
                <button className="primary" disabled={!canSend || !reply.trim()}>
                  {busy ? 'Đang gửi…' : 'Gửi'} <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="community" aria-busy={loading || busy}>
      <div className="community-head">
        <PageTitle title="Cộng đồng" />
        <button
          type="button"
          className="community-refresh"
          disabled={loading || busy}
          onClick={() => void refresh()}
          aria-label="Tải lại"
          title="Tải lại"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {writing ? (
        <form className="community-form" onSubmit={post}>
          <div className="community-pick" role="group" aria-label="Loại bài">
            {(Object.keys(categories) as Category[]).map(key => (
              <button
                key={key}
                type="button"
                className={category === key ? 'selected' : ''}
                aria-pressed={category === key}
                onClick={() => setCategory(key)}
              >
                {categories[key]}
              </button>
            ))}
          </div>
          <label>
            <span className="visually-hidden">Tiêu đề</span>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              minLength={LIMITS.titleMin}
              maxLength={LIMITS.titleMax}
              placeholder="Tiêu đề"
              autoFocus
            />
          </label>
          <label>
            <span className="visually-hidden">Nội dung</span>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              maxLength={LIMITS.body}
              rows={5}
              placeholder={
                category === 'partners'
                  ? 'Bạn muốn luyện kỹ năng gì, trình độ, rảnh lúc nào?'
                  : category === 'tips'
                    ? 'Mẹo bạn đã thử và thấy hiệu quả…'
                    : 'Bạn đang vướng ở đâu?'
              }
            />
          </label>
          <div className="community-form-end">
            <NameField name={name} setName={setName} />
            <span className="community-actions">
              <button type="button" onClick={() => setWriting(false)}>
                Hủy
              </button>
              <button
                className="primary"
                disabled={!canSend || title.trim().length < LIMITS.titleMin || !body.trim()}
              >
                {busy ? 'Đang đăng…' : 'Đăng'} <Send size={16} />
              </button>
            </span>
          </div>
        </form>
      ) : (
        <button type="button" className="community-start" onClick={() => setWriting(true)}>
          Bạn muốn hỏi hoặc chia sẻ điều gì?
        </button>
      )}

      {status}

      <div className="community-filters">
        <div className="skill-tabs" role="group" aria-label="Lọc bài">
          {(['all', ...Object.keys(categories)] as (Category | 'all')[]).map(key => (
            <button
              key={key}
              type="button"
              className={filter === key ? 'selected' : ''}
              aria-pressed={filter === key}
              onClick={() => {
                setFilter(key);
                setShown(PAGE);
              }}
            >
              {key === 'all' ? 'Tất cả' : categories[key]}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={18} />
          <input
            type="search"
            aria-label="Tìm bài"
            placeholder="Tìm bài…"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
          />
        </label>
      </div>

      {loading && !board.viewerId && <p role="status">Đang tải…</p>}
      <ul className="community-list">
        {visible.slice(0, shown).map(t => (
          <li key={t.id}>
            <a href={`#community/${t.id}`}>
              <span className={`community-tag ${t.category}`}>{categories[t.category]}</span>
              <strong>{t.title}</strong>
              <span className="community-preview">{t.body}</span>
              <span className="community-by">
                {t.nickname} · {timeAgo(t.createdAt)}
                <span className="community-replies-count">
                  <MessageCircle size={14} /> {t.replies.length}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {ready && !visible.length && (
        <div className="community-empty">
          <Users size={28} strokeWidth={1.5} />
          <p>
            {board.threads.length
              ? 'Không tìm thấy bài nào.'
              : 'Chưa có bài nào. Mở đầu bằng một câu hỏi nhé.'}
          </p>
        </div>
      )}
      {visible.length > shown && (
        <button type="button" className="community-more" onClick={() => setShown(shown + PAGE)}>
          Xem thêm
        </button>
      )}

      {offline && (
        <p className="community-rules">
          Đang dùng dữ liệu mẫu: bài bạn đăng chỉ lưu trên trình duyệt này, người khác không thấy.
        </p>
      )}
      <p className="community-rules">
        Bài đăng ai cũng xem được. Đừng để số điện thoại, địa chỉ hay đề thi có bản quyền. Bạn chỉ xóa được
        bài đăng từ trình duyệt này.
      </p>
    </section>
  );
}
