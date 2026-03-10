import type { Todo } from '../types/todo';

const BASE_URL = '/api';

export type ApiError = {
  detail: string;
  code: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    }));
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  async getTodos(): Promise<Todo[]> {
    const response = await fetch(`${BASE_URL}/todos`);
    return handleResponse<Todo[]>(response);
  },

  async createTodo(description: string): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    return handleResponse<Todo>(response);
  },

  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return handleResponse<Todo>(response);
  },

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
