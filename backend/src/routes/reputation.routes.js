const express = require('express');
const Business = require('../models/Business');
const Review = require('../models/Review');
const {
  summarizeInsights,
  buildRecommendations,
  suggestReply
} = require('../services/nlp.service');

const router = express.Router();

/**
 * GET /api/reputation/:businessId/reviews
 * Returns all reviews for a business, with optional sentiment + source filters.
 */
router.get('/:businessId/reviews', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { sentiment = 'all', source = 'all' } = req.query;

    const query = { businessId };
    if (sentiment !== 'all') query.sentiment = sentiment;
    if (source !== 'all') query.source = source;

    const reviews = await Review.find(query).sort({ reviewedAt: -1 }).lean();
    res.json({ total: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reputation/:businessId/dashboard
 * Full dashboard: business info, avg rating, sentiment breakdown,
 * top complaints/compliments, recommendations, source breakdown, recent reviews.
 */
router.get('/:businessId/dashboard', async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId).lean();
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const reviews = await Review.find({ businessId }).sort({ reviewedAt: -1 }).lean();
    const summary = summarizeInsights(reviews);

    // Build per-source breakdown
    const sourceMap = {};
    for (const r of reviews) {
      if (!sourceMap[r.source]) {
        sourceMap[r.source] = { source: r.source, count: 0, ratingSum: 0 };
      }
      sourceMap[r.source].count    += 1;
      sourceMap[r.source].ratingSum += r.rating;
    }

    const sourceBreakdown = Object.values(sourceMap).map((x) => ({
      source:    x.source,
      count:     x.count,
      avgRating: Number((x.ratingSum / x.count).toFixed(2))
    }));

    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2))
        : 0;

    res.json({
      business,
      totalReviews:          reviews.length,
      averageRating:         avgRating,
      sentimentDistribution: summary.sentimentDistribution,
      topComplaints:         summary.topComplaints,
      topCompliments:        summary.topCompliments,
      recommendations:       buildRecommendations(summary),
      sourceBreakdown,
      recentReviews:         reviews.slice(0, 8)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reputation/:businessId/reviews/:reviewId/suggest-response
 * Returns an AI-generated (or heuristic fallback) reply for a given review.
 */
router.post('/:businessId/reviews/:reviewId/suggest-response', async (req, res, next) => {
  try {
    const { businessId, reviewId } = req.params;

    const [business, review] = await Promise.all([
      Business.findById(businessId).lean(),
      Review.findOne({ _id: reviewId, businessId }).lean()
    ]);

    if (!business) return res.status(404).json({ error: 'Business not found' });
    if (!review)   return res.status(404).json({ error: 'Review not found' });

    const response = await suggestReply(review, business.name);
    res.json({ reviewId, suggestedResponse: response });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

