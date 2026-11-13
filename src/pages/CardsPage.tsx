import { useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Check, Eye, Pencil, Plus, RotateCcw, Search, Trash2, Volume2 } from 'lucide-react';
import {
  dueCards,
  findWord,
  intervals,
  levelLabel,
  limits,
  type CardInput,
  type Flashcard,
} from '../flashcards';
import { PageTitle, formatDate } from '../ui';
import { SampleDecks } from './SampleDecks';
import type { Level } from '../content/levels';

const blank: CardInput = { word: '', meaning: '', example: '' };
const dayLabel = (key: string) => formatDate(`${key}T12:00:00+07:00`);

export function CardForm({
  initial = blank,
  submitLabel,
  onSubmit,
  onCancel,
  idPrefix,
  duplicate,
}: {
  initial?: CardInput;
  submitLabel: string;
  onSubmit: (input: CardInput) => void;
  onCancel?: () => void;
  idPrefix: string;
  /** Returns a message when the word already exists. */
  duplicate?: (word: string) => string | undefined;
}) {
  const [input, setInput] = useState(initial);
  const warning = input.word.trim() ? duplicate?.(input.word) : undefined;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.word.trim() || !input.meaning.trim()) return;
    onSubmit(input);
    setInput(blank);
  }
  const field = (key: keyof CardInput) => ({
    id: `${idPrefix}-${key}`,
    value: input[key],
    maxLength: limits[key],
    onChange: (e: { target: { value: string } }) => setInput({ ...input, [key]: e.target.value }),
  });
  return (
    <form className="card-form" onSubmit={submit}>
      <label htmlFor={`${idPrefix}-word`}>Từ hoặc cụm từ</label>
      <input {...field('word')} lang="en" required autoComplete="off" placeholder="e.g. carry out" />
      <label htmlFor={`${idPrefix}-meaning`}>Nghĩa</label>
      <input {...field('meaning')} required autoComplete="off" placeholder="thực hiện, tiến hành" />
      <label htmlFor={`${idPrefix}-example`}>Câu ví dụ (không bắt buộc)</label>
      <textarea
        {...field('example')}
        lang="en"
        rows={2}
        placeholder="The survey was carried out by students."
      />
      {warning && <p className="card-warning">{warning}</p>}
      <div className="actions">
        <button className="primary" type="submit" disabled={!input.word.trim() || !input.meaning.trim()}>
          <Plus size={18} />
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

function Review({
  cards,
  todayKey,
  onReview,
}: {
  cards: Flashcard[];
  todayKey: string;
  onReview: (id: string, remembered: boolean) => void;
}) {
  // Until the first card is revealed the queue follows the due list, so cards added
  // now are included. After that the session is fixed: forgotten cards return tomorrow.
  const [session, setSession] = useState<string[] | null>(null);
  const [position, setPosition] = useState(0);
  const [shown, setShown] = useState(false);
  const [result, setResult] = useState({ remembered: 0, forgotten: 0 });
  // Answer buttons replace the reveal button and vice versa; keep keyboard focus in the card.
  const panel = useRef<HTMLElement>(null);
  const refocus = () =>
    requestAnimationFrame(() =>
      (panel.current?.querySelector<HTMLButtonElement>('button.primary') ?? panel.current)?.focus(),
    );
  const due = dueCards(cards, todayKey);
  const queue = session ?? due.map(c => c.id);
  const card = cards.find(c => c.id === queue[position]);

  if (!card) {
    const upcoming = cards.map(c => c.due).sort()[0];
    return (
      <section className="panel card-review done" aria-label="Ôn thẻ hôm nay" ref={panel} tabIndex={-1}>
        {session && (
          <div className="flip-celebrate" aria-hidden="true">
            🎉
          </div>
        )}
        <h2>{session ? 'Đã ôn xong lượt này' : 'Không có thẻ cần ôn hôm nay'}</h2>
        {session && (
          <p>
            Nhớ {result.remembered} thẻ · quên {result.forgotten} thẻ.
          </p>
        )}
        {!cards.length ? (
          <p>Chưa có thẻ nào.</p>
        ) : (
          upcoming && <p>Lần ôn tiếp theo: {upcoming <= todayKey ? 'hôm nay' : dayLabel(upcoming)}.</p>
        )}
        {due.length > 0 && (
          <button
            className="primary"
            onClick={() => {
              setSession(null);
              setPosition(0);
              setShown(false);
              setResult({ remembered: 0, forgotten: 0 });
            }}
          >
            Ôn {due.length} thẻ còn lại
          </button>
        )}
      </section>
    );
  }
  function answer(remembered: boolean) {
    onReview(card!.id, remembered);
    setResult(r =>
      remembered ? { ...r, remembered: r.remembered + 1 } : { ...r, forgotten: r.forgotten + 1 },
    );
    setShown(false);
    setPosition(p => p + 1);
    refocus();
  }
  function flip() {
    if (!session) setSession(queue);
    setShown(s => !s);
  }
  function speak(event: MouseEvent) {
    event.stopPropagation();
    try {
      const utterance = new SpeechSynthesisUtterance(card!.word);
      utterance.lang = 'en-US';
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch {
      // Speech not supported; the button simply does nothing.
    }
  }
  const progress = Math.round((position / Math.max(queue.length, 1)) * 100);
  return (
    <section
      className="panel card-review"
      aria-label="Ôn thẻ hôm nay"
      ref={panel}
      tabIndex={-1}
      onKeyDown={e => {
        if ((e.target as HTMLElement).tagName === 'INPUT') return;
        if (e.key === ' ') {
          e.preventDefault();
          flip();
        } else if (shown && e.key === '1') answer(false);
        else if (shown && e.key === '2') answer(true);
      }}
    >
      <div className="panel-head">
        <h2>Ôn hôm nay</h2>
        <span>
          {position + 1}/{queue.length}
        </span>
      </div>
      <div className="flip-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="flip-scene">
        <button
          key={card.id}
          type="button"
          className={shown ? 'flip-card flipped' : 'flip-card'}
          onClick={flip}
          aria-label={shown ? `${card.meaning}. Bấm để lật lại` : `${card.word}. Bấm để xem nghĩa`}
        >
          <span className="flip-face flip-front">
            <span className="flip-level">{levelLabel(card.level)}</span>
            <span className="flip-word" lang="en">
              {card.word}
            </span>
            <span className="flip-hint">Bấm thẻ hoặc nhấn Space để lật</span>
          </span>
          <span className="flip-face flip-back">
            <span className="flip-word small" lang="en">
              {card.word}
            </span>
            <span className="flip-meaning">{card.meaning}</span>
            {card.example && (
              <span className="flip-example" lang="en">
                “{card.example}”
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          className="flip-speak"
          onClick={speak}
          aria-label="Nghe phát âm"
          title="Nghe phát âm"
        >
          <Volume2 size={18} />
        </button>
      </div>
      {shown ? (
        <div className="flip-answers">
          <button className="flip-forgot" onClick={() => answer(false)}>
            <RotateCcw size={18} /> Quên
            <small>ôn lại ngày mai · phím 1</small>
          </button>
          <button className="flip-remembered" onClick={() => answer(true)}>
            <Check size={18} /> Nhớ
            <small>sau {intervals[Math.min(card.level, intervals.length - 1)]} ngày · phím 2</small>
          </button>
        </div>
      ) : (
        <button className="primary flip-reveal" onClick={flip}>
          <Eye size={18} /> Hiện nghĩa
        </button>
      )}
    </section>
  );
}

export function CardsPage({
  cards,
  todayKey,
  onAdd,
  onEdit,
  onDelete,
  onReview,
  onAddDeck,
  level,
}: {
  cards: Flashcard[];
  todayKey: string;
  level?: Level;
  /** Adds the words not yet present; returns how many were added. */
  onAddDeck: (inputs: CardInput[]) => number;
  onAdd: (input: CardInput) => void;
  onEdit: (id: string, input: CardInput) => void;
  onDelete: (id: string) => void;
  onReview: (id: string, remembered: boolean) => void;
}) {
  const [editing, setEditing] = useState<string>();
  const [query, setQuery] = useState('');
  const [deckMessage, setDeckMessage] = useState('');
  const [tab, setTab] = useState<'review' | 'cards' | 'decks'>(cards.length ? 'review' : 'decks');
  const [adding, setAdding] = useState(false);
  const decks = (intro: boolean) => (
    <SampleDecks
      cards={cards}
      level={level}
      intro={intro}
      onAdd={(inputs, title) => {
        const added = onAddDeck(inputs);
        setDeckMessage(`Đã thêm ${added} thẻ từ bộ “${title}”.`);
        setTab('review');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
  const due = dueCards(cards, todayKey).length;
  const needle = query.trim().toLocaleLowerCase('vi');
  const shown = [...cards]
    .reverse()
    .filter(c => !needle || `${c.word} ${c.meaning}`.toLocaleLowerCase('vi').includes(needle));
  const duplicate = (word: string, except?: string) => {
    const found = findWord(cards, word);
    return found && found.id !== except ? `“${found.word}” đã có trong bộ thẻ.` : undefined;
  };
  return (
    <>
      <PageTitle title="Từ vựng" description={`Ôn lại sau ${intervals.join('–')} ngày.`} />
      {deckMessage && (
        <p role="status" className="notice deck-message">
          {deckMessage}
        </p>
      )}
      <div className="cards-tabs" role="tablist" aria-label="Từ vựng">
        {(
          [
            ['review', `Ôn tập${due ? ` (${due})` : ''}`],
            ['cards', `Thẻ của tôi (${cards.length})`],
            ['decks', 'Bộ thẻ mẫu'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'selected' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'review' && (
        <div className="cards-review-wrap">
          <Review cards={cards} todayKey={todayKey} onReview={onReview} />
        </div>
      )}
      {tab === 'decks' && decks(cards.length === 0)}
      {tab === 'cards' && (
        <section className="card-list" aria-labelledby="card-list-title">
          <div className="card-list-bar">
            {adding ? null : (
              <button className="primary" onClick={() => setAdding(true)}>
                <Plus size={17} /> Thêm thẻ
              </button>
            )}
            {cards.length > 5 && (
              <label className="search card-search">
                <Search size={17} aria-hidden="true" />
                <span className="visually-hidden">Tìm thẻ</span>
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm từ…"
                />
              </label>
            )}
          </div>
          {adding && (
            <div className="panel card-add">
              <CardForm
                idPrefix="new-card"
                submitLabel="Thêm thẻ"
                onSubmit={onAdd}
                onCancel={() => setAdding(false)}
                duplicate={w => duplicate(w)}
              />
            </div>
          )}
          <h2 id="card-list-title" className="visually-hidden">
            Thẻ của tôi
          </h2>

          {cards.length === 0 ? (
            <p className="muted">Chưa có thẻ nào.</p>
          ) : shown.length === 0 ? (
            <p className="muted">Không có thẻ khớp “{query}”.</p>
          ) : (
            <ul className="outcome-list card-grid">
              {shown.map(card => (
                <li key={card.id} className="card-row">
                  {editing === card.id ? (
                    <CardForm
                      idPrefix={`edit-${card.id}`}
                      initial={card}
                      submitLabel="Lưu"
                      onSubmit={input => {
                        onEdit(card.id, input);
                        setEditing(undefined);
                      }}
                      onCancel={() => setEditing(undefined)}
                      duplicate={w => duplicate(w, card.id)}
                    />
                  ) : (
                    <>
                      <div className="card-row-main">
                        <strong lang="en">{card.word}</strong>
                        <span>{card.meaning}</span>
                        {card.example && <small lang="en">{card.example}</small>}
                      </div>
                      <span className="card-row-meta">
                        {levelLabel(card.level)}
                        <small>{card.due <= todayKey ? 'Cần ôn hôm nay' : `Ôn ${dayLabel(card.due)}`}</small>
                      </span>
                      <span className="card-row-actions">
                        <button onClick={() => setEditing(card.id)} aria-label={`Sửa thẻ ${card.word}`}>
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa thẻ “${card.word}”?`)) onDelete(card.id);
                          }}
                          aria-label={`Xóa thẻ ${card.word}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
