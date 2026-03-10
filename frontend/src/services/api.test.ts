import { describe, it, expect } from 'vitest';
import { api } from './api';

describe('api', () => {
  it('exports getTodos function', () => {
    expect(typeof api.getTodos).toBe('function');
  });

  it('exports createTodo function', () => {
    expect(typeof api.createTodo).toBe('function');
  });

  it('exports toggleTodo function', () => {
    expect(typeof api.toggleTodo).toBe('function');
  });

  it('exports deleteTodo function', () => {
    expect(typeof api.deleteTodo).toBe('function');
  });
});
