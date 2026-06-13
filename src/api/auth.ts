import api from './axios';
import { AuthResponse } from '../types';

export const register = async (data: { nom: string; email: string; motdepasse: string; role: string }): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const login = async (data: { email: string; motdepasse: string }): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
