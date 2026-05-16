const Review   = require('../models/Review');
const { analyzeReview } = require('./nlp.service');
const { aggregateReviews } = require('../connectors');

/**
 * Seeds a newly created business with reviews if none exist yet.
 * Tries all configured real sources first (Reddit, Google Places, SerpAPI, Apify).
 * Falls back to static seed data when no live source returns anything.
 */
async function seedIfEmpty(business) {
  const existingCount = await Review.countDocuments({ businessId: business._id });
  if (existingCount > 0) return;

  console.log(`\n[Bootstrap] First-time seed for "${business.name}" (${business.city})`);

  const { reviews: rawReviews, sources, usedFallback } = await aggregateReviews(
    business.name,
    business.city,
    business.type
  );

  console.log(`[Bootstrap] ${rawReviews.length} raw reviews from [${sources.join(', ')}]${usedFallback ? ' (fallback)' : ''}`);

  const enriched = [];
  for (const item of rawReviews) {
    const analysis = await analyzeReview(item.content, item.rating);
    enriched.push({
      ...item,
      businessId: business._id,
      sentiment:  analysis.sentiment,
      topics:     analysis.topics,
      emotion:    analysis.emotion,
      priority:   analysis.priority
    });
  }

  if (enriched.length > 0) {
    await Review.insertMany(enriched);
    console.log(`[Bootstrap] Inserted ${enriched.length} enriched reviews`);
  }
}

/**
 * Force re-scrape: wipe existing reviews and re-seed from live sources.
 * Called by POST /api/reputation/:businessId/refresh
 */
async function reseedBusiness(business) {
  await Review.deleteMany({ businessId: business._id });
  console.log(`[Bootstrap] Cleared reviews for "${business.name}" — re-seeding…`);
  await seedIfEmpty(business);
}

module.exports = { seedIfEmpty, reseedBusiness };
