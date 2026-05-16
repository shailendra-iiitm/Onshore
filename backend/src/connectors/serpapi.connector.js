

const axios = require('axios');

const BASE = 'https://serpapi.com/search.json';

/** Resolve Google Maps data_id for a business (needed to pull reviews) */
async function resolveGoogleMapsDataId(businessName, city, apiKey) {
  const params = new URLSearchParams({
    engine:  'google_maps',
    q:       `${businessName} ${city}`,
    type:    'search',
    hl:      'en',
    api_key: apiKey
  });

  const { data } = await axios.get(`${BASE}?${params}`, { timeout: 12000 });
  const places = data.local_results || [];

  if (!places.length) {
    console.warn(`[SerpAPI] No Google Maps listing for "${businessName}" in "${city}"`);
    return null;
  }

  console.log(`[SerpAPI] Google Maps match: ${places[0].title} (${places[0].address})`);
  return places[0].data_id;
}

/** Fetch reviews for a resolved data_id */
async function fetchGoogleMapsReviews(dataId, apiKey) {
  const params = new URLSearchParams({
    engine:   'google_maps_reviews',
    data_id:  dataId,
    sort_by:  'newestFirst',
    hl:       'en',
    api_key:  apiKey
  });

  const { data } = await axios.get(`${BASE}?${params}`, { timeout: 12000 });

  return (data.reviews || [])
    .filter((r) => (r.snippet || '').length >= 20)
    .map((r) => ({
      source:     'google',
      author:     r.user?.name || 'Anonymous',
      content:    r.snippet,
      rating:     r.rating || 3,
      reviewedAt: r.iso_date ? new Date(r.iso_date) : new Date()
    }));
}

/** Fetch Yelp reviews via SerpAPI */
async function fetchYelpReviews(businessName, city, apiKey) {
  // Step 1 — search for the business on Yelp
  const searchParams = new URLSearchParams({
    engine:    'yelp',
    find_desc: businessName,
    find_loc:  city,
    api_key:   apiKey
  });

  const searchRes = await axios.get(`${BASE}?${searchParams}`, { timeout: 12000 });
  const biz = searchRes.data?.organic_results?.[0];
  if (!biz?.place_id) {
    console.warn(`[SerpAPI/Yelp] No Yelp listing found for "${businessName}" in "${city}"`);
    return [];
  }

  // Step 2 — fetch reviews for that listing
  const revParams = new URLSearchParams({
    engine:   'yelp_reviews',
    place_id: biz.place_id,
    api_key:  apiKey
  });

  const revRes = await axios.get(`${BASE}?${revParams}`, { timeout: 12000 });

  return (revRes.data?.reviews || [])
    .filter((r) => (r.comment?.text || '').length >= 20)
    .map((r) => ({
      source:     'other',           // closest available enum
      author:     r.user?.name || 'Yelp User',
      content:    r.comment.text,
      rating:     r.rating || 3,
      reviewedAt: r.date ? new Date(r.date) : new Date()
    }));
}

/**
 * Main export — fetches Google Maps + Yelp reviews via SerpAPI
 * @param {string} businessName
 * @param {string} city
 * @returns {Promise<Array>}
 */
async function fetchSerpApiReviews(businessName, city) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.log('[SerpAPI] SERPAPI_KEY not set — skipping');
    return [];
  }

  console.log(`[SerpAPI] Fetching reviews for "${businessName}" in "${city}"…`);
  const results = [];

  // Google Maps reviews
  try {
    const dataId = await resolveGoogleMapsDataId(businessName, city, apiKey);
    if (dataId) {
      const gmRevs = await fetchGoogleMapsReviews(dataId, apiKey);
      console.log(`[SerpAPI/GoogleMaps] Got ${gmRevs.length} reviews`);
      results.push(...gmRevs);
    }
  } catch (err) {
    console.warn(`[SerpAPI/GoogleMaps] ${err.message}`);
  }

  // Yelp reviews
  try {
    const yelpRevs = await fetchYelpReviews(businessName, city, apiKey);
    console.log(`[SerpAPI/Yelp] Got ${yelpRevs.length} reviews`);
    results.push(...yelpRevs);
  } catch (err) {
    console.warn(`[SerpAPI/Yelp] ${err.message}`);
  }

  return results;
}

module.exports = { fetchSerpApiReviews };

