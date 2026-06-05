import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token to outgoing requests if it exists in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  const response = await API.post('/api/auth/login', { email, password });
  return response.data;
};

export const signup = async (username, email, password) => {
  const response = await API.post('/api/auth/signup', { username, email, password });
  return response.data;
};

export const getPosts = async () => {
  const response = await API.get('/api/posts');
  return response.data;
};

export const createPost = async (content, imageUrl) => {
  const response = await API.post('/api/posts', { text: content, image: imageUrl });
  return response.data;
};

export const likePost = async (id) => {
  const response = await API.post(`/api/posts/${id}/like`);
  return response.data;
};

export const commentPost = async (id, comment) => {
  const response = await API.post(`/api/posts/${id}/comment`, { comment });
  return response.data;
};

export default API;
