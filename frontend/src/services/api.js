import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const contractAPI = {
  getInfo: () => api.get('/contract/info'),
  getBalance: () => api.get('/contract/balance'),
  getQuorum: () => api.get('/contract/quorum'),
  deposit: (data) => api.post('/contract/deposit', data)
};

export const proposalAPI = {
  getAll: () => api.get('/proposals'),
  getById: (id) => api.get(`/proposals/${id}`),
  create: (data) => api.post('/proposals', data),
  vote: (id, vote) => api.post(`/proposals/${id}/vote`, { vote }),
  execute: (id) => api.post(`/proposals/${id}/execute`)
};

export const memberAPI = {
  getAll: () => api.get('/members'),
  getByAddress: (address) => api.get(`/members/${address}`),
  register: (data) => api.post('/members/register', data)
};

export default api;
