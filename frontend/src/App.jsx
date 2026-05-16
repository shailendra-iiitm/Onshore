import { useState } from 'react';
import SearchPage from './components/SearchPage';
import OverviewTab from './components/OverviewTab';
import ReviewsTab from './components/ReviewsTab';
import RecommendationsTab from './components/RecommendationsTab';
import { refreshBusiness, getDashboard, getReviews } from './api';

const TABS = [
  { id: 'overview',        label: '📊 Overview' },
  { id: 'reviews',         label: '💬 Reviews' },
  { id: 'recommendations', label: '💡 Recommendations' }
];

const SOURCE_META = {
  google:      { icon: '🔵', label: 'Google' },
  tripadvisor: { icon: '🟢', label: 'TripAdvisor' },
  reddit:      { icon: '🟠', label: 'Reddit' },
  zomato:      { icon: '🔴', label: 'Zomato' },
  instagram:   { icon: '💜', label: 'Instagram' },
  swiggy:      { icon: '🟡', label: 'Swiggy' },
  other:       { icon: '⚪', label: 'Other' },
  seed:        { icon: '🌱', label: 'Demo data' }
};

export default function App() {
  const [result,     setResult]     = useState(null);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg,  setStatusMsg]  = useState('');

  function handleResult(data) {
    setResult(data);
    setActiveTab('overview');
    setStatusMsg('');
  }

  function handleReset() {
    setResult(null);
    setStatusMsg('');
  }

  async function handleRefresh() {
    if (!result || refreshing) return;
    try {
      setRefreshing(true);
      setStatusMsg('🔄 Re-scraping live sources (Reddit + configured APIs)…');

      await refreshBusiness(result.business._id);

      // Wait ~10 s for background job then reload dashboard data
      setTimeout(async () => {
        try {
          const [dash, revs] = await Promise.all([
            getDashboard(result.business._id),
            getReviews(result.business._id)
          ]);
          setResult((prev) => ({ ...prev, dashboard: dash, reviews: revs.reviews || [] }));
          setStatusMsg('✅ Dashboard refreshed with the latest live reviews!');
        } catch {
          setStatusMsg('⚠️ Refresh ran — reload the page if the data looks stale.');
        } finally {
          setRefreshing(false);
        }
      }, 10000);
    } catch (err) {
      setStatusMsg('❌ Refresh failed: ' + (err?.response?.data?.error || err.message));
      setRefreshing(false);
    }
  }

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <span className="brand-name">🌊 OnShore</span>
            <span className="brand-sub">Reputation Manager</span>
          </div>
          {result && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Re-scrape Reddit, SerpAPI (Google Maps + Yelp), Apify (Google Maps + TripAdvisor)"
              >
                {refreshing ? '⏳ Refreshing…' : '🔄 Refresh Sources'}
              </button>
              <button type="button" className="btn-ghost" onClick={handleReset}>
                ← New Search
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="main">
        {!result ? (
          <SearchPage onResult={handleResult} />
        ) : (
          <div className="dashboard">

            {/* Business banner */}
            <div className="biz-banner">
              <h1 className="biz-name">{result.business.name}</h1>
              <p className="biz-meta">
                <span className="biz-type-badge">{result.business.type}</span>
                <span>📍 {result.business.city}</span>
                <span>💬 {result.dashboard.totalReviews} reviews</span>
                <span>⭐ {result.dashboard.averageRating} avg</span>
              </p>

              {/* Live source pills */}
              {result.dashboard.sourceBreakdown?.length > 0 && (
                <div className="source-badges">
                  <span className="source-badges-label">Sources:</span>
                  {result.dashboard.sourceBreakdown.map((s) => {
                    const m = SOURCE_META[s.source] || { icon: '🔗', label: s.source };
                    return (
                      <span key={s.source} className="source-badge-pill" title={`${s.count} reviews · ⭐ ${s.avgRating}`}>
                        {m.icon} {m.label} ({s.count})
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status message */}
            {statusMsg && <div className="status-msg">{statusMsg}</div>}

            {/* Tab bar */}
            <div className="tab-bar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={'tab-btn ' + (activeTab === tab.id ? 'tab-btn-active' : '')}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            {activeTab === 'overview'        && <OverviewTab dashboard={result.dashboard} />}
            {activeTab === 'reviews'         && <ReviewsTab businessId={result.business._id} initialReviews={result.reviews} />}
            {activeTab === 'recommendations' && <RecommendationsTab recommendations={result.dashboard.recommendations} />}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2026 OnShore Labs · AI-Powered Reputation Management</p>
      </footer>
    </div>
  );
}
