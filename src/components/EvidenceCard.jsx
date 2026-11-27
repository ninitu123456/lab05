import { memo } from 'react';

// Created once at module level — not on every render
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function formatDuration(totalSec) {
  if (!totalSec) return null;
  const m = Math.floor(totalSec / 60);
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function EvidenceCard({ item }) {
  const duration = formatDuration(item.durationSec);

  return (
    <article className="evidence-card" aria-labelledby={`evidence-${item._id}`}>
      <header className="evidence-card__header">
        <span className={`evidence-card__tag evidence-card__tag--${item.tag}`}>{item.tag}</span>
        {duration && (
          <span className="evidence-card__duration" aria-label={`Duration ${duration}`}>
            {duration}
          </span>
        )}
      </header>
      <h3 id={`evidence-${item._id}`} className="evidence-card__title">{item.title}</h3>
      <p className="evidence-card__summary">{item.summary}</p>
      <footer className="evidence-card__meta">
        <span>{item.player}</span>
        <time dateTime={item.recordedAt}>{dateFormatter.format(new Date(item.recordedAt))}</time>
      </footer>
    </article>
  );
}

// memo: when switching pages, cards that stay on screen (same item reference) skip re-render
export default memo(EvidenceCard);