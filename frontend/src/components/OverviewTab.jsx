import { SentimentBar, SOURCE_COLORS, SOURCE_ICONS } from './UIKit';

function MetricCard({ icon, label, value, sub, color }) {
  return (
    <div className="metric-card" style={{ borderTopColor: color }}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-body">
        <div className="metric-label">{label}</div>
        <div className="metric-value" style={{ color }}>{value}</div>
        {sub && <div className="metric-sub">{sub}</div>}
      </div>
    </div>
  );
}

function TopicList({ items, type }) {
  if (!items || items.length === 0)
    return <p className="empty-text">Nothing recorded yet.</p>;
  return (
    <ul className="topic-list">
      {items.map((item) => (
        <li key={item.topic} className={`topic-item topic-item-${type}`}>
          <span>{type === 'complaint' ? '⚠️' : '✨'} {item.topic}</span>
          <span className={`topic-count type-${type}`}>{item.count}x</span>
        </li>
      ))}
    </ul>
  );
}

function SourceBreakdown({ breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;
  const max = Math.max(...breakdown.map((s) => s.count));
  return (
    <div className="source-breakdown">
      {breakdown.map((s) => (
        <div key={s.source} className="source-row">
          <span className="source-name">
            <span style={{ marginRight: 6 }}>{SOURCE_ICONS[s.source] || '?'}</span>
            {s.source}
          </span>
          <div className="source-bar-wrap">
            <div
              className="source-bar"
              style={{
                width: `${Math.round((s.count / max) * 100)}%`,
                background: SOURCE_COLORS[s.source] || '#94A3B8'
              }}
            />
          </div>
          <span className="source-meta">{s.count} reviews · ⭐ {s.avgRating}</span>
        </div>
      ))}
    </div>
  );
}

export default function OverviewTab({ dashboard }) {
  const {
    totalReviews, averageRating, sentimentDistribution,
    topComplaints, topCompliments, sourceBreakdown
  } = dashboard;

  return (
    <div className="tab-content">
      <div className="metrics-grid">
        <MetricCard icon="⭐" label="Average Rating" value={`${averageRating} / 5`} color="#F59E0B" />
        <MetricCard icon="📋" label="Total Reviews" value={totalReviews} color="#6366F1" />
        <MetricCard
          icon="😊"
          label="Positive"
          value={sentimentDistribution.positive}
          sub={`${totalReviews ? Math.round((sentimentDistribution.positive / totalReviews) * 100) : 0}% of reviews`}
          color="#10B981"
        />
        <MetricCard
          icon="😞"
          label="Negative"
          value={sentimentDistribution.negative}
          sub={`${totalReviews ? Math.round((sentimentDistribution.negative / totalReviews) * 100) : 0}% of reviews`}
          color="#EF4444"
        />
      </div>

      <div className="card">
        <h3 className="card-title">Sentiment Distribution</h3>
        <SentimentBar
          positive={sentimentDistribution.positive}
          neutral={sentimentDistribution.neutral}
          negative={sentimentDistribution.negative}
          total={totalReviews}
        />
      </div>

      <div className="two-col">
        <div className="card">
          <h3 className="card-title">⚠️ Top Complaints</h3>
          <TopicList items={topComplaints} type="complaint" />
        </div>
        <div className="card">
          <h3 className="card-title">✨ Top Compliments</h3>
          <TopicList items={topCompliments} type="compliment" />
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">📊 Reviews by Source</h3>
        <SourceBreakdown breakdown={sourceBreakdown} />
      </div>
    </div>
  );
}

