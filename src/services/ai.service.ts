import { fetchClient } from './api';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
}

export const aiService = {
  chat: async (message: string): Promise<ChatResponse> => {
    return fetchClient('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
