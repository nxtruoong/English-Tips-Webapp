import { Check, Plus } from 'lucide-react';
import { missingCount, type CardInput, type Flashcard } from '../flashcards';
import { sampleDecks } from '../content/sampleDecks';
import type { Level } from '../content/levels';

/** Starter decks the learner can copy into their own cards. Decks for their level come first. */
export function SampleDecks({
  cards,
  level,
  onAdd,
  intro,
}: {
  cards: Flashcard[];
  level?: Level;
  onAdd: (inputs: CardInput[], title: string) => void;
  intro: boolean;
}) {
  // Decks whose main level matches come first; the rest keep their order.
  const fits = (deck: (typeof sampleDecks)[number]) => Boolean(level && deck.levels[0] === level);
  const decks = [...sampleDecks].sort((a, b) => Number(fits(b)) - Number(fits(a)));
  return (
    <section className={intro ? 'sample-decks intro' : 'sample-decks'} aria-labelledby="sample-title">
      <div className="section-heading">
        <h2 id="sample-title">Bộ thẻ mẫu</h2>
        <span>{decks.length} bộ</span>
      </div>
      <div className="sample-grid">
        {decks.map(deck => {
          const missing = missingCount(cards, deck.cards);
          const suits = fits(deck);
          return (
            <article key={deck.id} className={suits ? 'panel sample-deck suits' : 'panel sample-deck'}>
              <div className="sample-head">
                <h3>{deck.title}</h3>
                {suits && <span className="sample-badge">Hợp với bạn</span>}
              </div>
              <p>{deck.description}</p>
              <small>{deck.cards.length} từ</small>
              <details>
                <summary>Xem trước</summary>
                <ul>
                  {deck.cards.map(card => (
                    <li key={card.word}>
                      <strong lang="en">{card.word}</strong> {card.meaning}
                    </li>
                  ))}
                </ul>
              </details>
              <button
                className={missing ? 'primary' : ''}
                disabled={!missing}
                onClick={() => onAdd(deck.cards, deck.title)}
              >
                {missing ? <Plus size={18} /> : <Check size={18} />}
                {missing === 0
                  ? 'Đã có trong bộ thẻ'
                  : missing === deck.cards.length
                    ? `Thêm ${missing} thẻ`
                    : `Thêm ${missing} thẻ còn thiếu`}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
