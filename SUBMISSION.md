# Assignment Submission — OnShore Reputation Manager

**Candidate:** Shailendra Shukla  
**Role Applied:** Full Stack Developer Intern  
**Date:** May 2026  
**Repository:** https://github.com/shailendra-iiitm/Onshore

---

## Assignment Brief

Build a web application that helps hospitality businesses (restaurants / hotels) monitor their online reputation by aggregating reviews, performing sentiment analysis, and generating actionable AI-powered insights and response suggestions.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | React 19 + Vite 8 (plain JSX) | Fast HMR, minimal config, no TS overhead for MVP |
| Backend | Node.js + Express 4 (CommonJS) | Simple, well-understood, matches stack requirement |
| Database | MongoDB + Mongoose 8 | Flexible schema for evolving review shapes |
| NLP / AI | OpenAI `gpt-4o-mini` + heuristic fallback | Cost-efficient model; heuristic ensures zero-cost baseline |
| Styling | CSS custom properties (no framework) | Zero build deps; full design control with two media query breakpoints |
| Review sources | Reddit, SerpAPI, Apify | All free without a credit card |
| Deployment | Frontend → Vercel, Backend → Render | Both have generous free tiers |

---

## Architecture

```
Browser (React/Vite)
   │  HTTP + axios
Express API (Node / server.js → app.js → routes/)
   ├─ /api/business  →  find-or-create business (MongoDB upsert)
   ├─ /api/reputation
   │     ├─ GET  /:id/dashboard       ← metrics, sentiment, recs
   │     ├─ GET  /:id/reviews         ← filterable review list
   │     ├─ POST /:id/reviews/:rid/suggest-response
   │     ├─ POST /:id/refresh         ← background re-scrape
   │     └─ GET  /sources             ← connector status
   └─ /api/health
   │
   ├─ services/bootstrap.service.js  →  on first search, calls aggregator
   ├─ services/nlp.service.js        →  OpenAI or heuristic analysis
   └─ connectors/
         ├─ reddit.connector.js      →  public unauthenticated JSON API
         ├─ serpapi.connector.js     →  Google Maps + Yelp via SerpAPI
         ├─ apify.connector.js       →  Google Maps + TripAdvisor via Apify
         └─ index.js                 →  parallel aggregation + dedup
   │
MongoDB  →  Business + Review collections
```

---

## What I built

### 1 — Business Search & Persistence
- User enters business name, city, and type (restaurant / hotel)
- `POST /api/business/search` does a MongoDB `findOneAndUpdate` with `$setOnInsert` — idempotent, always fast on repeat searches
- Unique compound index on `{ name, city }` prevents duplicates

### 2 — Multi-source Review Aggregation
Three real connectors, run in **parallel**, results **deduplicated** by content fingerprint:

| Connector | Source | Key needed |
|-----------|--------|-----------|
| `reddit.connector.js` | Reddit public JSON search API | ❌ None — always on |
| `serpapi.connector.js` | Google Maps reviews + Yelp | `SERPAPI_KEY` (100/month free, no card) |
| `apify.connector.js` | Google Maps + TripAdvisor | `APIFY_TOKEN` ($5/month free, no card) |
| Seed fallback | Static mock data | — automatic when live returns nothing |

### 3 — NLP Analysis Engine (`nlp.service.js`)
Two-tier approach — both paths return identical shapes:

**OpenAI mode** (when `OPENAI_API_KEY` is set):
- Model: `gpt-4o-mini`, `temperature: 0.2`, `response_format: json_object`
- Returns: `{ sentiment, topics[], emotion, priority }`

**Heuristic mode** (always available, zero cost):
- Sentiment from star rating (≥4 → positive, ≤2 → negative)
- Topics via keyword lookup (9 categories)
- Emotion derived from sentiment
- Priority: negative → high, neutral → medium, positive → low

### 4 — Reputation Dashboard (3 tabs)

**📊 Overview**
- 4 metric cards: avg rating, total reviews, positive count, negative count
- Proportional sentiment distribution bar (animated segments)
- Top complaints + top compliments (by topic frequency, colour-coded)
- Reviews by source bar chart (platform colours, avg rating per source)

**💬 Reviews**
- All reviews as cards with left sentiment-colour border
- Filter pills: All / Positive / Neutral / Negative (live API refetch)
- Per review: stars, sentiment pill, priority badge, topic tags, source dot, date
- **Suggest Reply** → calls OpenAI (or fallback template) → one-click copy

**💡 Recommendations**
- Built by `buildRecommendations()` — maps top complaint topics to 9 pre-researched advice templates
- Each card: title, description, impact badge (high/medium/low), concrete action items
- Covers: waiting time, service, hygiene, cleanliness, pricing, food quality, ambience, wifi, room quality

### 5 — Refresh Sources
- Navbar **🔄 Refresh Sources** button calls `POST /api/reputation/:id/refresh`
- Clears existing reviews, re-runs the full aggregation pipeline in the background
- Frontend polls after 10 s and reloads dashboard data

---

## Completed vs Mocked

| Feature | Status | Notes |
|---------|--------|-------|
| Business search + MongoDB persistence | ✅ **Real** | Upsert with unique compound index |
| Reddit review scraping | ✅ **Real** | Live public API, always on |
| SerpAPI scraping (Google Maps + Yelp) | ✅ **Real** | Requires free `SERPAPI_KEY` |
| Apify scraping (Google Maps + TripAdvisor) | ✅ **Real** | Requires free `APIFY_TOKEN` |
| NLP: sentiment / topics / emotion / priority | ✅ **Real** | OpenAI or heuristic |
| Suggested reply generation | ✅ **Real** | OpenAI or template |
| Recommendations engine | ✅ **Real** | Pattern-based, 9 topic categories |
| Source breakdown & deduplication | ✅ **Real** | Content fingerprint, parallel fetch |
| Refresh live sources on demand | ✅ **Real** | Background reseed |
| Seed / fallback review data | 🌱 **Mock** | 15 restaurant + 12 hotel static reviews (guaranteed fallback) |
| User authentication | ❌ **Not built** | Out of MVP scope |
| Real-time push updates | ❌ **Not built** | Polling on manual refresh instead |
| Pagination | ❌ **Not built** | All reviews returned in one call |
| Rate limiting | ❌ **Not built** | Would add `express-rate-limit` |

---



## Known Gaps / If I Had More Time

1. **Tests** — unit tests for `nlp.service.js` heuristic, integration tests for route handlers
2. **Pagination** — cursor-based pagination for large datasets
3. **Auth** — JWT + business-owner accounts so each login only sees their own businesses
4. **WebSocket** — push new review alerts in real time instead of polling
5. **Response tracking** — mark a review as "replied", store the reply, track response rate KPI
6. **Competitor benchmarking** — compare your sentiment score vs nearby similar businesses
7. **Email digests** — weekly summary of new reviews + sentiment changes
8. **Rate limiting** — `express-rate-limit` on all write endpoints

---

## Running the Project

See **[SETUP.md](./SETUP.md)** for full step-by-step instructions.

```bash
# Backend
cd backend
cp .env.example .env   # fill MONGODB_URI; optionally add SERPAPI_KEY / APIFY_TOKEN
npm install && npm run dev
# → http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install && npm run dev
# → http://localhost:5173
```

---

## Environment Variable Reference

`backend/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/onshore_reputation
MONGODB_DB=onshore_reputation
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=          # optional
OPENAI_MODEL=gpt-4o-mini
SERPAPI_KEY=             # optional — 100 free/month at serpapi.com (no card)
APIFY_TOKEN=             # optional — $5/month free at apify.com (no card)
```

`frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```
