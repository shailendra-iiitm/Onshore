import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export async function searchBusiness(payload) {
  const { data } = await api.post('/business/search', payload);
  return data;
}

export async function getDashboard(businessId) {
  const { data } = await api.get(`/reputation/${businessId}/dashboard`);
  return data;
}

export async function getReviews(businessId, sentiment = 'all') {
  const { data } = await api.get(`/reputation/${businessId}/reviews`, {
    params: { sentiment }
  });
  return data;
}

export async function getSuggestedResponse(businessId, reviewId) {
  const { data } = await api.post(
    `/reputation/${businessId}/reviews/${reviewId}/suggest-response`
  );
  return data;
}

/** Trigger a live re-scrape of all configured sources for this business */
export async function refreshBusiness(businessId) {
  const { data } = await api.post(`/reputation/${businessId}/refresh`);
  return data;
}

/** See which connectors are currently active on the backend */
export async function getSourceStatus() {
  const { data } = await api.get('/reputation/sources');
  return data;
}
