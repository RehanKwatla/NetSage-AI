import axios from 'axios';

const API_BASE = '/api';

export const getCases = async () => {
  const response = await axios.get(`${API_BASE}/cases`);
  return response.data;
};

export const getCase = async (id) => {
  const response = await axios.get(`${API_BASE}/cases/${id}`);
  return response.data;
};

export const diagnoseCase = async (payload) => {
  const response = await axios.post(`${API_BASE}/diagnose`, payload);
  return response.data;
};

export const getReviews = async () => {
  const response = await axios.get(`${API_BASE}/reviews`);
  return response.data;
};

export const submitReview = async (payload) => {
  const response = await axios.post(`${API_BASE}/reviews`, payload);
  return response.data;
};

export const getDashboard = async () => {
  const response = await axios.get(`${API_BASE}/dashboard`);
  return response.data;
};
