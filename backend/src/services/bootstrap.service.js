const Review = require('../models/Review');
const { getSeedReviews } = require('../data/seedReviews');
const { analyzeReview } = require('./nlp.service');

/**
 * Seeds a newly created business with mock reviews if none exist yet.
 * Each review is enriched with NLP analysis (sentiment, topics, emotion, priority).
 */
async function seedIfEmpty(business) {
  const existingCount = await Review.countDocuments({ businessId: business._id });
  if (existingCount > 0) return;

  const base = getSeedReviews(business.type);
  const enriched = [];

  for (const item of base) {
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

  await Review.insertMany(enriched);
}

module.exports = { seedIfEmpty };

