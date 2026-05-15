import { useState } from 'react';
import SearchPage from './components/SearchPage';
import OverviewTab from './components/OverviewTab';
import ReviewsTab from './components/ReviewsTab';
import RecommendationsTab from './components/RecommendationsTab';
const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'reviews',         label: 'Reviews' },
  { id: 'recommendations', label: 'Recommendations' }
];
export default function App() {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  function handleResult(data) {
    setResult(data);
    setActiveTab('overview');
  }
  function handleReset() {
    setResult(null);
  }
  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={handleReset}>
            <span className="brand-name">OnShore</span>
            <span className="brand-sub">Reputation Manager</span>
          </div>
          {result && (
            <button type="button" className="btn-ghost" onClick={handleReset}>
              New Search
            </button>
          )}
        </div>
      </nav>
      <main className="main">
        {!result ? (
          <SearchPage onResult={handleResult} />
        ) : (
          <div className="dashboard">
            <div className="biz-banner">
              <h1 className="biz-name">{result.business.name}</h1>
              <p className="biz-meta">
                <span className="biz-type-badge">{result.business.type}</span>
                <span>{result.business.city}</span>
                <span>{result.dashboard.totalReviews} reviews</span>
                <span>Avg {result.dashboard.averageRating}</span>
              </p>
            </div>
            <div className="tab-bar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={"tab-btn " + (activeTab === tab.id ? "tab-btn-active" : "")}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === "overview" && <OverviewTab dashboard={result.dashboard} />}
            {activeTab === "reviews" && (
              <ReviewsTab businessId={result.business._id} initialReviews={result.reviews} />
            )}
            {activeTab === "recommendations" && (
              <RecommendationsTab recommendations={result.dashboard.recommendations} />
            )}
          </div>
        )}
      </main>
      <footer className="footer">
        <p>2026 OnShore Labs - AI-Powered Reputation Management</p>
      </footer>
    </div>
  );
}
