/**
 * googlePlaces.connector.js
 *
 * Fetches reviews from the Google Places API (New).
 * Free quota: $200/month credit — covers ~11,000 Place Details calls before billing.
 *
 * Setup:
 *   1. Go to https://console.cloud.google.com
 *   2. Enable "Places API" (New)
 *   3. Create an API key under APIs & Services → Credentials
 *   4. Add to backend/.env: GOOGLE_PLACES_API_KEY=<your-key>
 *
 * Returns reviews shaped as:
 *   { source, author, content, rating, reviewedAt }
 */

const axios = require('axios');

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

/** Step 1 — resolve a place_id from business name + city */
async function resolvePlaceId(businessName, city, apiKey) {
  const query = encodeURIComponent(`${businessName} ${city}`);
  const url   = `${PLACES_BASE}/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`;

  const { data } = await axios.get(url, { timeout: 8000 });

  if (data.status !== 'OK' || !data.candidates?.length) {
    console.warn(`[GooglePlaces] No place found for "${businessName}" in "${city}". Status: ${data.status}`);
    return null;
  }

  const c = data.candidates[0];
  console.log(`[GooglePlaces] Matched: ${c.name} — ${c.formatted_address}`);
  return c.place_id;
}

/** Step 2 — fetch up to 5 reviews for a place_id */
async function fetchPlaceReviews(placeId, apiKey) {
  const url = `${PLACES_BASE}/details/json?place_id=${placeId}&fields=name,reviews&language=en&reviews_sort=newest&key=${apiKey}`;

  const { data } = await axios.get(url, { timeout: 8000 });

  if (data.status !== 'OK') {
    console.warn(`[GooglePlaces] Details API status: ${data.status}`);
    return [];
  }

  return (data.result?.reviews || [])
    .filter((r) => (r.text || '').length >= 20)
    .map((r) => ({
      source:     'google',
      author:     r.author_name || 'Anonymous',
      content:    r.text,
      rating:     r.rating || 3,
      reviewedAt: new Date(r.time * 1000)
    }));
}

/**
 * Main export
 * @param {string} businessName
 * @param {string} city
 * @returns {Promise<Array>}
 */
async function fetchGooglePlacesReviews(businessName, city) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.log('[GooglePlaces] GOOGLE_PLACES_API_KEY not set — skipping');
    return [];
  }

  console.log(`[GooglePlaces] Fetching reviews for "${businessName}" in "${city}"…`);
  try {
    const placeId = await resolvePlaceId(businessName, city, apiKey);
    if (!placeId) return [];

    const reviews = await fetchPlaceReviews(placeId, apiKey);
    console.log(`[GooglePlaces] Got ${reviews.length} reviews`);
    return reviews;
  } catch (err) {
    console.error(`[GooglePlaces] Error: ${err.message}`);
    return [];
  }
}

module.exports = { fetchGooglePlacesReviews };

