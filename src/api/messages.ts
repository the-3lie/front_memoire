import api from './axios';
import { Message } from '../types';

export const getAll = async (): Promise<Message[]> => {
  const res = await api.get('/messages');
  return res.data;
};

export const create = async (data: { destinataire: string; contenu: string }): Promise<Message> => {
  const res = await api.post('/messages', data);
  return res.data;
};
