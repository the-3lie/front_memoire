import api from './axios';
import { Notification } from '../types';

export const getAll = async (): Promise<Notification[]> => {
  const res = await api.get('/notifications');
  return res.data;
};

export const create = async (data: Partial<Notification>): Promise<Notification> => {
  const res = await api.post('/notifications', data);
  return res.data;
};
