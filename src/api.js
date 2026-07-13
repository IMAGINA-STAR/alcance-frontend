const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error al conectar con el servidor.');
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  getSpaces: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.minFollowers) params.set('minFollowers', filters.minFollowers);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    const qs = params.toString();
    return request(`/spaces${qs ? `?${qs}` : ''}`);
  },
  createSpace: (payload, token) => request('/spaces', { method: 'POST', body: payload, token }),
  updateSpace: (id, payload, token) => request(`/spaces/${id}`, { method: 'PATCH', body: payload, token }),

  getInfluencerProfile: (token) => request('/influencer/profile', { token }),
  updateInfluencerProfile: (payload, token) =>
    request('/influencer/profile', { method: 'PATCH', body: payload, token }),

  sendRequest: (payload, token) => request('/requests', { method: 'POST', body: payload, token }),
  getReceivedRequests: (token) => request('/requests/received', { token }),
  getSentRequests: (token) => request('/requests/sent', { token }),
  respondToRequest: (id, status, token) =>
    request(`/requests/${id}/respond`, { method: 'PATCH', body: { status }, token }),

  createCheckout: (requestId, token) =>
    request(`/requests/${requestId}/checkout`, { method: 'POST', token }),
  getPaymentStatus: (requestId, token) =>
    request(`/requests/${requestId}/payment-status`, { token }),

  getMessages: (requestId, token) => request(`/requests/${requestId}/messages`, { token }),
  sendMessage: (requestId, body, token) =>
    request(`/requests/${requestId}/messages`, { method: 'POST', body: { body }, token }),
};
