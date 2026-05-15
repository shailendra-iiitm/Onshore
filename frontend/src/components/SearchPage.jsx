import { useState } from 'react';
import { searchBusiness, getDashboard, getReviews } from '../api';

export default function SearchPage({ onResult }) {
  const [form, setForm] = useState({ name: '', city: '', type: 'restaurant' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.city.trim()) {
      setError('Please provide both business name and city.');
      return;
    }
    try {
      setLoading(true);
      const business = await searchBusiness(form);
      const [dash, revs] = await Promise.all([
        getDashboard(business._id),
        getReviews(business._id)
      ]);
      onResult({ business, dashboard: dash, reviews: revs.reviews || [] });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="search-hero-icon">🏢</div>
        <h2>AI Reputation Manager</h2>
        <p>Enter your business details to generate a full reputation dashboard powered by AI</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-form-row">
          <div className="form-field">
            <label>Business Name</label>
            <input
              placeholder="e.g. The Grand Café"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>City</label>
            <input
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="restaurant">🍽️ Restaurant</option>
              <option value="hotel">🏨 Hotel</option>
            </select>
          </div>
          <div className="form-field form-field-btn">
            <label>&nbsp;</label>
            <button type="submit" disabled={loading} className="btn-primary btn-lg">
              {loading ? (
                <span className="btn-loading"><span className="spinner" /> Analyzing…</span>
              ) : (
                '🔍 Analyze Reputation'
              )}
            </button>
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

