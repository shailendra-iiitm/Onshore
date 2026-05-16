
const axios = require('axios');

const APIFY_BASE = 'https://api.apify.com/v2';

const ACTORS = {
  googleMaps:  'compass~google-maps-reviews-scraper',
  tripadvisor: 'maxcopell~tripadvisor'
};

/**
 * Run an Apify actor synchronously and return dataset items.
 * Times out after 60 s to avoid hanging the request.
 */
async function runActor(actorId, input, token) {
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=55&memory=256`;

  const { data } = await axios.post(url, input, {
    headers:  { 'Content-Type': 'application/json' },
    timeout:  65000
  });

  return Array.isArray(data) ? data : [];
}

/** Fetch Google Maps reviews via Apify */
async function fetchApifyGoogleMapsReviews(businessName, city, token) {
  console.log(`[Apify/GoogleMaps] Starting actor for "${businessName}" in "${city}"…`);

  const items = await runActor(ACTORS.googleMaps, {
    searchStringsArray: [`${businessName} ${city}`],
    maxReviews:         20,
    reviewsSort:        'newest',
    language:           'en',
    includeHistogram:   false
  }, token);

  const reviews = [];
  for (const place of items) {
    for (const r of (place.reviews || [])) {
      if (!r.text || r.text.length < 20) continue;
      reviews.push({
        source:     'google',
        author:     r.name || 'Anonymous',
        content:    r.text.slice(0, 800),
        rating:     r.stars || 3,
        reviewedAt: r.publishedAtDate ? new Date(r.publishedAtDate) : new Date()
      });
    }
  }

  console.log(`[Apify/GoogleMaps] Got ${reviews.length} reviews`);
  return reviews;
}

/** Fetch TripAdvisor reviews via Apify (works for restaurants + hotels) */
async function fetchApifyTripAdvisorReviews(businessName, city, token) {
  console.log(`[Apify/TripAdvisor] Starting actor for "${businessName}" in "${city}"…`);

  const items = await runActor(ACTORS.tripadvisor, {
    locationFullName:     `${businessName}, ${city}`,
    lastReviewCount:      15,
    includeAttractions:   false,
    includeHotels:        true,
    includeRestaurants:   true,
    includeReviews:       true,
    language:             'en'
  }, token);

  const reviews = [];
  for (const item of items) {
    for (const r of (item.reviews || [])) {
      const text = r.text || r.title || '';
      if (text.length < 20) continue;
      reviews.push({
        source:     'tripadvisor',
        author:     r.username || r.userProfile?.displayName || 'TripAdvisor User',
        content:    text.slice(0, 800),
        rating:     r.rating || 3,
        reviewedAt: r.publishedDate ? new Date(r.publishedDate) : new Date()
      });
    }
  }

  console.log(`[Apify/TripAdvisor] Got ${reviews.length} reviews`);
  return reviews;
}

/**
 * Main export — fetches Google Maps + TripAdvisor reviews via Apify
 * @param {string} businessName
 * @param {string} city
 * @returns {Promise<Array>}
 */
async function fetchApifyReviews(businessName, city) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.log('[Apify] APIFY_TOKEN not set — skipping');
    return [];
  }

  const results = [];

  try {
    results.push(...await fetchApifyGoogleMapsReviews(businessName, city, token));
  } catch (err) {
    console.warn(`[Apify/GoogleMaps] ${err.message}`);
  }

  try {
    results.push(...await fetchApifyTripAdvisorReviews(businessName, city, token));
  } catch (err) {
    console.warn(`[Apify/TripAdvisor] ${err.message}`);
  }

  return results;
}

module.exports = { fetchApifyReviews };

