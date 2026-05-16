# OnShore Labs — AI Reputation Manager

> **Full-stack MVP** that helps hospitality businesses (restaurants & hotels) monitor their online reputation by aggregating reviews from multiple live sources, running AI-powered sentiment analysis, and generating actionable dashboards + suggested replies.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8, plain JSX, CSS custom properties |
| **Backend** | Node.js 18+ / Express 4, CommonJS |
| **Database** | MongoDB (Mongoose 8) — local or Atlas |
| **NLP / AI** | OpenAI `gpt-4o-mini` with heuristic fallback |
| **Review sources** | Reddit (free), SerpAPI (free), Apify (free) |
| **Deployment** | Frontend → Vercel · Backend → Render |

---

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Business search + upsert (name / city / type) | ✅ Live |
| 2 | Multi-source review aggregation | ✅ Live (Reddit always; SerpAPI + Apify with keys) |
| 3 | NLP sentiment analysis (positive / neutral / negative) | ✅ Live (OpenAI or heuristic) |
| 4 | Topic extraction (food, service, hygiene, pricing…) | ✅ Live |
| 5 | Emotion + priority scoring per review | ✅ Live |
| 6 | Reputation dashboard — metrics, sentiment bar, source breakdown | ✅ Live |
| 7 | Top complaints & top compliments (ranked by frequency) | ✅ Live |
| 8 | AI-suggested reply per review (copy to clipboard) | ✅ Live |
| 9 | Actionable recommendations engine (9 topic categories) | ✅ Live |
| 10 | Review filter by sentiment (All / Positive / Neutral / Negative) | ✅ Live |
| 11 | **🔄 Refresh Sources** — re-scrape live data on demand | ✅ Live |
| 12 | Connector status endpoint (`GET /api/reputation/sources`) | ✅ Live |
| 13 | Seed data fallback (realistic mock reviews) | ✅ Always available |
| 14 | Responsive design (mobile, tablet, desktop) | ✅ Live |

---

## Review Sources (all FREE, no credit card required)

| Source | Key required | Free quota | What it returns |
|--------|-------------|-----------|----------------|
| **Reddit** | ❌ None | Unlimited (rate-limited ~60 req/min) | Public posts mentioning the business |
| **SerpAPI** | `SERPAPI_KEY` | 100 searches / month | Google Maps reviews + Yelp reviews |
| **Apify** | `APIFY_TOKEN` | $5 / month platform credits | Google Maps reviews + TripAdvisor reviews |
| **Seed fallback** | — | Always | 12–15 realistic mock reviews |

> ℹ️ Google Places API was intentionally excluded — it requires a billing account with a credit card, even for the free tier.

All sources run in parallel. Results are deduplicated by content fingerprint before being stored.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser  (React + Vite — localhost:5173)                   │
│  SearchPage → App → { OverviewTab, ReviewsTab, RecsTab }    │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / REST (axios)
┌──────────────────────▼──────────────────────────────────────┐
│  Express API  (Node.js — localhost:5000)                    │
│  app.js  →  src/routes/{business, reputation}              │
│            src/services/{nlp, bootstrap}                   │
│            src/connectors/{reddit, serpapi, apify, index}  │
└──────────┬───────────────────────┬──────────────────────────┘
           │  Mongoose             │  OpenAI / heuristic NLP
┌──────────▼──────────┐   ┌───────▼────────────────────────┐
│  MongoDB Atlas      │   │  OpenAI gpt-4o-mini            │
│  Business + Review  │   │  (optional — heuristic if none)│
└─────────────────────┘   └────────────────────────────────┘
           │  (parallel, on first search)
┌──────────▼──────────────────────────────────────────────────┐
│  Connector Aggregator (src/connectors/index.js)            │
│  ├─ Reddit  (always on, unauthenticated JSON API)          │
│  ├─ SerpAPI (Google Maps + Yelp, if SERPAPI_KEY set)       │
│  └─ Apify   (Google Maps + TripAdvisor, if APIFY_TOKEN set)│
└─────────────────────────────────────────────────────────────┘
```

### Data flow

```
1. User enters business name + city + type
2. POST /api/business/search  →  upsert business in MongoDB
3. If no reviews yet  →  aggregateReviews() fires in parallel:
      Reddit search  +  SerpAPI Google Maps/Yelp  +  Apify Google Maps/TripAdvisor
      Deduplicated results  →  NLP enrichment per review  →  insertMany()
4. GET /api/reputation/:id/dashboard  →  aggregated metrics returned
5. Frontend renders: metrics cards, sentiment bar, complaints/compliments, source breakdown
6. User switches to Reviews tab  →  GET /api/reputation/:id/reviews
7. User clicks "Suggest Reply"  →  POST suggest-response  →  OpenAI or heuristic
8. User clicks "🔄 Refresh Sources"  →  POST /refresh  →  background reseed
```

---

## API Endpoints

```
GET  /api/health
POST /api/business/search                                     ← find-or-create business
GET  /api/reputation/:businessId/dashboard                   ← full dashboard payload
GET  /api/reputation/:businessId/reviews?sentiment=all       ← filtered review list
POST /api/reputation/:businessId/reviews/:reviewId/suggest-response
POST /api/reputation/:businessId/refresh                     ← re-scrape live sources
GET  /api/reputation/sources                                 ← connector status
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/shailendra-iiitm/Onshore.git
cd Onshore

# 2. Backend
cd backend
cp .env.example .env          # fill in MONGODB_URI (and optional keys)
npm install
npm run dev                   # → http://localhost:5000

# 3. Frontend (new terminal, from project root)
cd frontend
cp .env.example .env          # VITE_API_URL already correct
npm install
npm run dev                   # → http://localhost:5173
```

Full step-by-step instructions: **[SETUP.md](./SETUP.md)**

---

## Environment Variables

See `backend/.env.example` for the full template.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string (local or Atlas) |
| `OPENAI_API_KEY` | ❌ Optional | Enables GPT-4o-mini analysis; heuristic used if not set |
| `SERPAPI_KEY` | ❌ Optional | SerpAPI — [serpapi.com](https://serpapi.com) — 100 free/month, no card |
| `APIFY_TOKEN` | ❌ Optional | Apify — [apify.com](https://apify.com) — $5/month free credits, no card |

---

## What is completed vs what is mocked

| Capability | Real or Mock? |
|------------|--------------|
| Business search / persistence | ✅ Real — MongoDB |
| Reddit review scraping | ✅ Real — live unauthenticated API |
| SerpAPI review scraping | ✅ Real — when `SERPAPI_KEY` is set |
| Apify review scraping | ✅ Real — when `APIFY_TOKEN` is set |
| NLP sentiment / topics / emotion | ✅ Real — OpenAI or heuristic |
| Suggested reply generation | ✅ Real — OpenAI or template fallback |
| Recommendations engine | ✅ Real — pattern-based with 9 topic categories |
| Seed data (fallback) | 🌱 Mock — 15 realistic but static reviews |
| Authentication | ❌ Not implemented (MVP) |
| Real-time updates | ❌ Not implemented (polling on refresh) |
| Pagination | ❌ Not implemented — returns all reviews |

---

## Future Improvements

- [ ] **Zomato / TripAdvisor direct API** — when public APIs become officially available
- [ ] **WebSocket** — push live review alerts to the dashboard
- [ ] **Pagination** — cursor-based for large review sets
- [ ] **Authentication** — JWT-based business-owner accounts
- [ ] **Multi-business** — manage multiple locations from one account
- [ ] **Email digests** — weekly reputation summary emails
- [ ] **Response tracking** — mark reviews as "replied", track response rate
- [ ] **Competitor analysis** — compare sentiment vs nearby similar businesses
- [ ] **Test suite** — unit tests for `nlp.service.js`, integration tests for API routes
- [ ] **Rate limiting** — protect public endpoints with express-rate-limit
- [ ] **PostgreSQL migration** — replace in-memory seed with fully relational schema

---

## Screenshots

> *(Run the app locally and take screenshots as described in SETUP.md)*

| Screen | Description |
|--------|-------------|
| `screenshots/01-search.png` | Business search form |
| `screenshots/02-overview.png` | Overview tab — metrics, sentiment bar |
| `screenshots/03-complaints.png` | Top complaints & compliments grid |
| `screenshots/04-sources.png` | Reviews by source breakdown |
| `screenshots/05-reviews.png` | Reviews tab with filter pills |
| `screenshots/06-suggest-reply.png` | AI suggested reply expanded |
| `screenshots/07-recommendations.png` | Recommendations tab |
| `screenshots/08-refresh.png` | Refresh Sources in progress |

---

*Built for the OnShore Labs Full Stack Developer assignment — May 2026*
