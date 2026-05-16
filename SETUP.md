# Setup Guide

## Prerequisites

- **Node.js** v18+ (project uses v24)
- **MongoDB** — local (`mongod`) or Atlas cluster
- **npm** v9+
- **OpenAI API key** (optional — falls back to keyword heuristic without it)

---

## 1. Clone & navigate

```bash
git clone https://github.com/shailendra-iiitm/Onshore.git
cd Onshore
```

---

## 2. Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/onshore_reputation   # or your Atlas URI
MONGODB_DB=onshore_reputation
CORS_ORIGIN=http://localhost:5173
OPENAI_API_KEY=sk-...          # optional — leave blank for heuristic mode
OPENAI_MODEL=gpt-4o-mini
```

```bash
# Start backend (with auto-reload)
npm run dev
# → Backend running on http://localhost:5000
```

Verify it works:
```bash
curl http://localhost:5000/api/health
# {"ok":true,"timestamp":"..."}
```

---

## 3. Frontend setup

```bash
# from project root
cd frontend

# Install dependencies
npm install

# Copy env template
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000/api — no changes needed
```

```bash
# Start frontend dev server
npm run dev
# → http://localhost:5173
```

---

## 4. Using the app

1. Open `http://localhost:5173`
2. Enter a business name (e.g. **The Grand Café**), city (e.g. **Mumbai**), and type (**Restaurant**)
3. Click **Analyze Reputation**
4. The app will:
   - Find or create the business in MongoDB
   - Auto-seed it with 15 realistic reviews (first time only)
   - Run NLP analysis on each review (OpenAI or heuristic)
   - Display the full reputation dashboard
5. Navigate between **Overview**, **Reviews**, and **Recommendations** tabs
6. On any review, click **Suggest Reply** to get an AI-generated response

---

## 5. Running without OpenAI

The app works fully without an OpenAI key. `nlp.service.js` automatically falls back to a keyword heuristic that determines sentiment, topics, emotion, and priority from the review text.

---

## 6. Build for production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

