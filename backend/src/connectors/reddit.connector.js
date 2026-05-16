/**
 * reddit.connector.js
 *
 * Fetches public Reddit posts mentioning a business as review-like data.
 * Uses the unauthenticated Reddit JSON API — no API key needed.
 * Rate limit: 60 req/min. Sufficient for on-demand use.
 *
 * Returns reviews in the same shape as seedReviews.js items:
 *   { source, author, content, rating, reviewedAt }
 * Rating is inferred from upvote ratio + NLP sentiment (1-5 scale).
 */

const axios = require('axios');

const REDDIT_BASE = 'https://www.reddit.com';

// Subreddits most likely to have hospitality reviews
const TARGET_SUBS = [
  'india', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata',
  'food', 'IndianFood', 'IndianStreetFood', 'travel', 'hotel', 'restaurants'
];

/**
 * Map Reddit upvote_ratio (0-1) + sentiment keywords → approximate 1-5 star rating
 */
function inferRating(text, upvoteRatio) {
  const lc = text.toLowerCase();

  const negativeWords = ['terrible', 'horrible', 'awful', 'disgusting', 'worst', 'dirty',
    'rude', 'bad', 'poor', 'disappointing', 'avoid', 'never again', 'pathetic'];
  const positiveWords = ['amazing', 'excellent', 'fantastic', 'great', 'wonderful', 'best',
    'loved', 'outstanding', 'delicious', 'highly recommend', 'perfect', 'awesome'];

  const negCount = negativeWords.filter((w) => lc.includes(w)).length;
  const posCount = positiveWords.filter((w) => lc.includes(w)).length;

  // Start from ratio-based base (1-5)
  let base = Math.round(upvoteRatio * 4) + 1; // 1-5

  if (negCount >= 2) base = Math.min(base, 2);
  else if (negCount === 1) base = Math.min(base, 3);
  if (posCount >= 2) base = Math.max(base, 4);
  else if (posCount === 1) base = Math.max(base, 3);

  return Math.min(5, Math.max(1, base));
}

/**
 * Check if a post looks like a genuine review / experience post
 */
function isReviewLike(post) {
  const lc = (post.title + ' ' + (post.selftext || '')).toLowerCase();

  const reviewSignals = [
    'review', 'visited', 'tried', 'experience', 'went to', 'ordered', 'food',
    'service', 'staff', 'ambience', 'recommend', 'worth', 'avoid', 'place',
    'restaurant', 'hotel', 'cafe', 'dine', 'eat', 'stay', 'room', 'check in'
  ];

  const hasSignal = reviewSignals.some((s) => lc.includes(s));
  const hasEnoughText = (post.selftext || post.title || '').length >= 40;

  return hasSignal && hasEnoughText;
}

/**
 * Fetch Reddit posts mentioning businessName + city
 * @param {string} businessName
 * @param {string} city
 * @param {number} limit  max raw posts to fetch
 * @returns {Array}  review-shaped objects
 */
async function fetchRedditReviews(businessName, city, limit = 25) {
  const query = encodeURIComponent(`"${businessName}" "${city}"`);
  const url   = `${REDDIT_BASE}/search.json?q=${query}&sort=new&limit=${limit}&t=year&type=link`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'OnshoreReputationBot/1.0 (assignment project; no commercial use)'
    },
    timeout: 8000
  });

  const posts = response.data?.data?.children || [];

  const reviews = [];

  for (const { data: post } of posts) {
    // Skip if deleted, removed, or too short
    if (!post.author || post.author === '[deleted]') continue;
    if (post.removed_by_category)                    continue;

    const content = [post.title, post.selftext].filter(Boolean).join('\n\n').trim();
    if (!content || content.length < 40)             continue;
    if (!isReviewLike(post))                         continue;

    reviews.push({
      source:     'reddit',
      author:     `u/${post.author}`,
      content:    content.slice(0, 800), // cap length
      rating:     inferRating(content, post.upvote_ratio ?? 0.7),
      reviewedAt: new Date(post.created_utc * 1000)
    });
  }

  return reviews;
}

module.exports = { fetchRedditReviews };

