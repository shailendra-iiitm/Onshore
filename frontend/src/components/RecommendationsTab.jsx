export default function RecommendationsTab({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <div className="empty-state">No recommendations generated yet.</div>;
  }

  const impactMeta = {
    high:   { emoji: '🔴', label: 'High Impact',   color: '#EF4444' },
    medium: { emoji: '🟡', label: 'Medium Impact', color: '#F59E0B' },
    low:    { emoji: '🟢', label: 'Low Impact',    color: '#10B981' }
  };

  return (
    <div className="tab-content">
      <p className="tab-intro">
        These recommendations are generated based on patterns found across all customer reviews.
      </p>
      <div className="rec-list">
        {recommendations.map((rec, idx) => {
          const meta = impactMeta[rec.impact] || impactMeta.low;
          return (
            <div key={idx} className="rec-card">
              <div className="rec-header">
                <span className="rec-num">#{idx + 1}</span>
                <span className="rec-title">{rec.title || rec}</span>
                {rec.impact && (
                  <span
                    className="rec-impact-badge"
                    style={{ color: meta.color, borderColor: meta.color }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                )}
              </div>
              {rec.description && (
                <p className="rec-description">{rec.description}</p>
              )}
              {typeof rec === 'string' && (
                <p className="rec-description">{rec}</p>
              )}
              {rec.actionItems && rec.actionItems.length > 0 && (
                <ul className="rec-actions">
                  {rec.actionItems.map((item, i) => (
                    <li key={i}><span className="action-arrow">→</span> {item}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

