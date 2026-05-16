# Setup Guide — OnShore Labs Reputation Manager

## Prerequisites

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| Node.js | v18 | Project tested on v24 |
| npm | v9 | Comes with Node |
| MongoDB | 6+ | Local `mongod` or free Atlas cluster |
| OpenAI API key | — | **Optional** — app works without it via heuristic NLP |

---

## 1. Clone the repository

```bash
git clone https://github.com/shailendra-iiitm/Onshore.git
cd Onshore
```

Project structure:
```
Onshore/
├── backend/          ← Express API
├── frontend/         ← React + Vite
├── README.md
├── SETUP.md          ← (you are here)
└── SUBMISSION.md
```

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/onshore_reputation
#            ↑ or your Atlas URI:
#            mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/onshore_reputation

MONGODB_DB=onshore_reputation
CORS_ORIGIN=http://localhost:5173

# ── AI analysis (optional) ────────────────────────────────────
# Leave blank to use the free keyword heuristic instead
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# ── Review connectors — FREE, no credit card required ─────────
# Reddit runs automatically — no key needed.

# SerpAPI: Google Maps + Yelp reviews
# → sign up free at https://serpapi.com (100 searches/month, no card)
# → Dashboard → Your Account → API Key
SERPAPI_KEY=

# Apify: Google Maps + TripAdvisor reviews
# → sign up free at https://apify.com ($5/month credits, no card)
# → Settings → Integrations → Personal API Tokens → Create
APIFY_TOKEN=
```

Start the backend:
```bash
npm run dev
# ✅ Connected to MongoDB
# ✅ Backend running on http://localhost:5000
```

Verify it's running:
```bash
curl http://localhost:5000/api/health
# {"ok":true,"timestamp":"2026-05-16T..."}
```

Check which review connectors are active:
```bash
curl http://localhost:5000/api/reputation/sources
```

---

## 3. Frontend setup

Open a **new terminal** from the project root:

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  ← already correct, no changes needed
```

Start the frontend:
```bash
npm run dev
# → http://localhost:5173
```

---

## 4. Using the app

1. Open **http://localhost:5173** in your browser
2. Enter a business name (e.g. **The Grand Café**), city (e.g. **Mumbai**), type (**Restaurant**)
3. Click **Analyze Reputation**
4. What happens behind the scenes:
   - Business is found or created in MongoDB
   - All configured connectors run in parallel (Reddit + SerpAPI + Apify)
   - Each review is enriched with NLP (sentiment, topics, emotion, priority)
   - Results are stored in MongoDB and the dashboard loads
5. Navigate tabs:
   - **📊 Overview** — metrics cards, sentiment bar, complaints/compliments, source breakdown
   - **💬 Reviews** — full list with filter pills; click **Suggest Reply** on any review
   - **💡 Recommendations** — AI-ranked action items based on complaint patterns
6. Click **🔄 Refresh Sources** in the navbar to re-scrape live review data

---

## 5. Getting free API keys (no credit card needed)

### SerpAPI — Google Maps + Yelp reviews
1. Go to **https://serpapi.com** and create a free account (no card)
2. Dashboard → Your Account → **API Key**
3. Paste into `backend/.env` as `SERPAPI_KEY=<your-key>`
4. Free tier: **100 searches / month**

### Apify — Google Maps + TripAdvisor reviews
1. Go to **https://apify.com** and create a free account (no card)
2. Settings → Integrations → Personal API Tokens → **Create token**
3. Paste into `backend/.env` as `APIFY_TOKEN=<your-token>`
4. Free tier: **$5 / month platform credits** (~500 review fetches)

### Reddit (always on — no key needed)
The Reddit connector uses the public unauthenticated JSON API (`reddit.com/search.json`). It runs automatically for every business search with zero config.

---

## 6. Running without OpenAI

The app works **fully without an OpenAI key**. `nlp.service.js` has a two-tier design:

```
1. OpenAI GPT-4o-mini  (if OPENAI_API_KEY is set)
   → richer JSON-structured output, higher accuracy
   
2. Keyword heuristic   (always available, zero latency, zero cost)
   → rates sentiment from rating + keyword matching
   → extracts topics via keyword lookup
   → both paths return identical shape: { sentiment, topics, emotion, priority }
```

---

## 7. MongoDB Atlas (free cloud database)

If you don't have MongoDB installed locally:

1. Go to **https://cloud.mongodb.com** and create a free account
2. Create a free **M0 cluster** (no credit card)
3. Database Access → Add user with password
4. Network Access → Allow from anywhere (0.0.0.0/0) for dev
5. Connect → Drivers → Copy the URI (looks like `mongodb+srv://...`)
6. Paste into `backend/.env` as `MONGODB_URI=<your-atlas-uri>`

---

## 8. Build for production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/ — deploy to Vercel or any static host

# Backend
cd backend
npm start
# Reads from process.env — set variables on your host (Render, Railway, etc.)
```

### Taking screenshots

Once the app is running, take screenshots of:

```
1. Search page — empty form
2. Search page — form filled in
3. Dashboard loading state
4. Overview tab — metrics + sentiment bar
5. Overview tab — complaints & compliments
6. Overview tab — source breakdown
7. Reviews tab — review cards
8. Reviews tab — "Suggest Reply" expanded
9. Recommendations tab
10. Refresh Sources button during refresh
```

Save them in `screenshots/` at the project root.

---

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to MongoDB` | Check `MONGODB_URI` — is `mongod` running locally? |
| `CORS error in browser` | Ensure `CORS_ORIGIN=http://localhost:5173` in `backend/.env` |
| Backend starts but no reviews appear | Reddit might have returned 0 results — seed fallback kicks in automatically |
| `OpenAI 401` | Your `OPENAI_API_KEY` is invalid or has no credits |
| Port 5000 already in use | Set `PORT=5001` in `.env` and update `VITE_API_URL` in `frontend/.env` |
| SerpAPI `Invalid API key` | Recheck the key from serpapi.com dashboard |
| Apify actor timeout | Apify free actors can be slow on first run — timeout is set to 60s |
