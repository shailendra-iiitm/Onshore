

const { fetchApifyReviews }   = require('./apify.connector');
const { fetchSerpApiReviews } = require('./serpapi.connector');
const { fetchRedditReviews }  = require('./reddit.connector');
const { getSeedReviews }      = require('../data/seedReviews');

/** First 80 chars normalised — used to detect near-duplicates across sources */
function fingerprint(review) {
  return review.content.slice(0, 80).toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Run a connector; never throws — returns [] on any error */
async function safeRun(label, fn) {
  try {
    const results = await fn();
    console.log(`[Aggregator] ${label}: ${results.length} reviews`);
    return results;
  } catch (err) {
    console.warn(`[Aggregator] ${label} failed: ${err.message}`);
    return [];
  }
}

/**
 * Aggregate reviews from all configured no-card-required sources.
 * Falls back to seed data if nothing is returned.
 *
 * @param {string} businessName
 * @param {string} city
 * @param {string} businessType  'restaurant' | 'hotel'
 * @returns {Promise<{ reviews: Array, sources: string[], usedFallback: boolean }>}
 */
async function aggregateReviews(businessName, city, businessType = 'restaurant') {
  console.log(`\n[Aggregator] Fetching reviews for "${businessName}" | "${city}" | ${businessType}`);
  console.log(`[Aggregator] Active sources: ${getConfiguredSources().join(', ')}`);

  // Run Apify, SerpAPI, and Reddit in parallel
  const [apifyRevs, serpRevs, redditRevs] = await Promise.all([
    safeRun('Apify',   () => fetchApifyReviews(businessName, city)),
    safeRun('SerpAPI', () => fetchSerpApiReviews(businessName, city)),
    safeRun('Reddit',  () => fetchRedditReviews(businessName, city))
  ]);

  // Merge and deduplicate
  const seenFps    = new Set();
  const allReviews = [];
  const sourcesUsed = [];

  for (const review of [...apifyRevs, ...serpRevs, ...redditRevs]) {
    const fp = fingerprint(review);
    if (seenFps.has(fp)) continue;
    seenFps.add(fp);
    allReviews.push(review);
    if (!sourcesUsed.includes(review.source)) sourcesUsed.push(review.source);
  }

  if (allReviews.length === 0) {
    console.log('[Aggregator] No live reviews found — using seed fallback');
    return { reviews: getSeedReviews(businessType), sources: ['seed'], usedFallback: true };
  }

  console.log(`[Aggregator] Total unique reviews: ${allReviews.length} from [${sourcesUsed.join(', ')}]`);
  return { reviews: allReviews, sources: sourcesUsed, usedFallback: false };
}

/**
 * Returns the list of sources that are currently active.
 * Only includes no-credit-card-required sources.
 */
function getConfiguredSources() {
  const sources = ['reddit']; // always on, no key needed
  if (process.env.APIFY_TOKEN) sources.unshift('apify');   // $5/month free, no card
  if (process.env.SERPAPI_KEY) sources.push('serpapi');     // 100/month free, no card
  return sources;
}

module.exports = { aggregateReviews, getConfiguredSources };

