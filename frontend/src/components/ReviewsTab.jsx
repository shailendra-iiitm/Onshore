import { useState } from 'react';
import { getSuggestedResponse, getReviews } from '../api';
import { StarRating, SentimentPill, PriorityBadge, SourceDot } from './UIKit';

function ReviewCard({ review, businessId }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSuggest() {
    try {
      setLoading(true);
      const data = await getSuggestedResponse(businessId, review._id);
      setResponse(data.suggestedResponse);
    } catch {
      setResponse('Could not generate a response right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const dateStr = new Date(review.reviewedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className={`review-card sentiment-border-${review.sentiment}`}>
      <div className="review-top">
        <div className="review-author-row">
          <SourceDot source={review.source} />
          <strong className="review-author">{review.author}</strong>
          <span className="review-source">{review.source}</span>
          <span className="review-date">{dateStr}</span>
        </div>
        <div className="review-badges">
          <StarRating rating={review.rating} />
          <SentimentPill sentiment={review.sentiment} />
          <PriorityBadge priority={review.priority} />
        </div>
      </div>

      <p className="review-content">{review.content}</p>

      {review.topics && review.topics.length > 0 && (
        <div className="review-topics">
          {review.topics.map((t) => (
            <span key={t} className="topic-tag">{t}</span>
          ))}
        </div>
      )}

      <div className="review-actions">
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={handleSuggest}
          disabled={loading}
        >
          {loading ? '⏳ Generating…' : '✨ Suggest Reply'}
        </button>
      </div>

      {response && (
        <div className="suggested-reply">
          <div className="reply-header">
            <span>💬 Suggested Reply</span>
            <button type="button" className="btn-copy" onClick={handleCopy}>
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          </div>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default function ReviewsTab({ businessId, initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  async function applyFilter(val) {
    setFilter(val);
    try {
      setLoading(true);
      const data = await getReviews(businessId, val);
      setReviews(data.reviews || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-content">
      <div className="reviews-toolbar">
        <span className="reviews-count">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
        <div className="filter-pills">
          {['all', 'positive', 'neutral', 'negative'].map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-pill ${filter === s ? 'filter-pill-active' : ''}`}
              onClick={() => applyFilter(s)}
            >
              {s === 'all' ? '🔍 All' : s === 'positive' ? '😊 Positive' : s === 'neutral' ? '😐 Neutral' : '😞 Negative'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="loading-text">Loading reviews…</p>}

      {!loading && reviews.length === 0 && (
        <div className="empty-state">No reviews found for this filter.</div>
      )}

      {!loading && reviews.map((r) => (
        <ReviewCard key={r._id} review={r} businessId={businessId} />
      ))}
    </div>
  );
}

