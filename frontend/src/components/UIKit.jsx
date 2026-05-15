const SOURCE_COLORS = {
  google:      '#4285F4',
  zomato:      '#E23744',
  tripadvisor: '#00AA6C',
  instagram:   '#E1306C',
  reddit:      '#FF4500',
  x:           '#000000',
  swiggy:      '#FC8019',
  blog:        '#6366F1',
  other:       '#94A3B8'
};

const SOURCE_ICONS = {
  google:      'G',
  zomato:      'Z',
  tripadvisor: 'T',
  instagram:   'I',
  reddit:      'R',
  x:           'X',
  swiggy:      'S',
  blog:        'B',
  other:       '?'
};

export function SourceDot({ source }) {
  return (
    <span
      className="source-dot"
      style={{ background: SOURCE_COLORS[source] || SOURCE_COLORS.other, color: '#fff', fontWeight: 700 }}
      title={source}
    >
      {SOURCE_ICONS[source] || SOURCE_ICONS.other}
    </span>
  );
}

export function StarRating({ rating }) {
  return (
    <span className="star-rating" title={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star filled' : 'star empty'}>★</span>
      ))}
      <span className="star-num">{rating}/5</span>
    </span>
  );
}

export function SentimentPill({ sentiment }) {
  return <span className={`pill pill-${sentiment}`}>{sentiment}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-priority-${priority}`}>{priority}</span>;
}

export function SentimentBar({ positive, neutral, negative, total }) {
  const pPct   = total ? Math.round((positive / total) * 100) : 0;
  const nPct   = total ? Math.round((neutral  / total) * 100) : 0;
  const negPct = total ? Math.round((negative / total) * 100) : 0;

  return (
    <div className="sentiment-bar-wrap">
      <div className="sentiment-bar">
        <div className="segment segment-positive" style={{ width: `${pPct}%` }}   title={`Positive: ${pPct}%`} />
        <div className="segment segment-neutral"  style={{ width: `${nPct}%` }}   title={`Neutral: ${nPct}%`} />
        <div className="segment segment-negative" style={{ width: `${negPct}%` }} title={`Negative: ${negPct}%`} />
      </div>
      <div className="sentiment-legend">
        <span className="legend-item"><span className="legend-dot dot-positive" />{positive} Positive ({pPct}%)</span>
        <span className="legend-item"><span className="legend-dot dot-neutral"  />{neutral}  Neutral  ({nPct}%)</span>
        <span className="legend-item"><span className="legend-dot dot-negative" />{negative} Negative ({negPct}%)</span>
      </div>
    </div>
  );
}

export { SOURCE_COLORS, SOURCE_ICONS };

