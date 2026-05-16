# Assignment Submission — OnShore Reputation Manager

**Candidate:** Shailendra Shukla
**Role Applied:** Full Stack Developer
**Date:** May 2026
**Repository:** https://github.com/shailendra-iiitm/Onshore

---

## Assignment Brief (Interpreted)

Build a web application that helps hospitality businesses (restaurants / hotels) monitor their online reputation by aggregating reviews, performing sentiment analysis, and generating actionable AI-powered insights and response suggestions.

---

## What I Built

A full-stack application with the following capabilities:

### Search & Discovery
- User enters a business name, city, and type
- Backend performs an upsert (`findOneAndUpdate` with `$setOnInsert`) — finds existing or creates new
- On first search, the system auto-seeds 12–15 realistic mock reviews from multiple platforms

### NLP Analysis Engine
Every review is processed through `nlp.service.js`:
- **Sentiment** — positive / neutral / negative (based on rating + content)
- **Topic extraction** — keyword matching for food quality, service, hygiene, pricing, ambience, wifi, room quality, waiting time, cleanliness
- **Emotion** — happy / frustrated / neutral
- **Priority** — high / medium / low (negative reviews get high priority)
- **OpenAI mode** — if `OPENAI_API_KEY` is set, uses `gpt-4o-mini` with JSON response format for richer analysis
- **Offline/heuristic mode** — works without any API key

### Dashboard — 3 Tabs

**Overview Tab**
- 4 metric cards: average rating, total reviews, positive count, negative count
- Visual sentiment distribution bar (proportional segments)
- Top complaints and top compliments (aggregated by topic frequency)
- Reviews by source (bar chart with platform colors, avg rating per source)

**Reviews Tab**
- All reviews rendered as cards with sentiment colour border
- Filter pills: All / Positive / Neutral / Negative (live API call on each filter change)
- Per-review: star rating, sentiment pill, priority badge, topic tags, date, source dot
- **Suggest Reply** — calls `POST /api/reputation/:id/reviews/:reviewId/suggest-response`
- One-click copy for the suggested response

**Recommendations Tab**
- AI-generated (or pattern-based) recommendations ranked by impact (high / medium / low)
- Each card has: title, description, and a list of concrete action items
- 9 topic categories covered with specific, actionable advice

---

## Technical Decisions & Architecture

### Backend — Express + MongoDB (CommonJS)
```
server.js           ← DB connect-then-listen (fail-fast on no DB)
app.js              ← CORS, JSON, routes, 404, global error handler
src/config/db.js    ← connectMongo() with env-driven URI
src/models/         ← Mongoose schemas with enums, indexes, refs
src/data/           ← Seed data (15 restaurant + 12 hotel reviews)
src/services/       ← Business logic separated from route handlers
src/routes/         ← Thin route files, call services directly
```

### Frontend — React + Vite (plain JSX, no TypeScript)
```
src/api.js          ← Single axios instance, 4 named exports
src/styles.css      ← CSS custom properties design system (no Tailwind, no styled-components)
src/components/     ← SearchPage → App ← {OverviewTab, ReviewsTab, RecommendationsTab}
src/components/UIKit.jsx  ← Atomic reusable components
```

**Why plain CSS?** Zero build-time dependencies. The design system uses CSS custom properties (`--brand`, `--positive`, `--negative` etc.) making it easy to retheme. All responsive breakpoints handled with two media queries.

### NLP / AI Strategy
- Two-tier: OpenAI first, heuristic fallback
- Heuristic runs synchronously, zero latency, zero cost
- OpenAI mode uses `response_format: { type: 'json_object' }` for reliable structured output
- Both paths return identical shape: `{ sentiment, topics, emotion, priority }`

---


## What Works Without Setup

- The heuristic NLP runs with zero external dependencies
- No OpenAI key needed for full functionality
- Works with either local MongoDB or Atlas

---

## Known Gaps / If I Had More Time

- **Tests** — unit tests for `nlp.service.js` (heuristic analysis), integration tests for API endpoints
- **Pagination** — reviews endpoint returns all at once; would add cursor-based pagination
- **Auth** — no authentication; would add JWT-based business owner accounts
- **Real review ingestion** — replace seed data with a scraper/webhook for real platform reviews
- **WebSocket** — live dashboard updates as reviews come in

---

## Running the Project

See **[SETUP.md](./SETUP.md)** for full step-by-step instructions.

Quick start:
```bash
# Backend
cd backend && cp .env.example .env  # fill MONGODB_URI
npm install && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev
# → http://localhost:5173
```

