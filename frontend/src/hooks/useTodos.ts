import { useReducer, useCallback } from 'react';
import { api } from '../services/api';
import type { AppState, Action } from '../types/todo';

const initialState: AppState = {
  todos: [],
  loading: true,
  error: null,
};

function todoReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_TODOS':
      return { ...state, loading: true, error: null };
    case 'LOAD_TODOS_SUCCESS':
      return { ...state, loading: false, todos: action.payload };
    case 'LOAD_TODOS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_TODO':
      return {
        ...state,
        todos: [
          {
            id: action.payload.tempId,
            description: action.payload.description,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            optimistic: true,
          },
          ...state.todos,
        ],
      };
    case 'CREATE_TODO_SUCCESS':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.tempId ? action.payload.todo : t,
        ),
      };
    case 'CREATE_TODO_FAILURE':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.tempId),
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: !t.completed, optimistic: true }
            : t,
        ),
      };
    case 'TOGGLE_TODO_SUCCESS':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case 'TOGGLE_TODO_FAILURE':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id
            ? { ...t, completed: !t.completed, optimistic: false, error: action.payload.error }
            : t,
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.id),
      };
    case 'DELETE_TODO_SUCCESS':
      return state; // already removed optimistically
    case 'DELETE_TODO_FAILURE':
      return {
        ...state,
        todos: [
          ...state.todos,
          { ...action.payload.todo, error: action.payload.error },
        ],
      };
    case 'CLEAR_ERROR':
      if (action.payload?.id) {
        return {
          ...state,
          todos: state.todos.map((t) =>
            t.id === action.payload!.id ? { ...t, error: undefined } : t,
          ),
        };
      }
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useTodos() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const loadTodos = useCallback(async () => {
    dispatch({ type: 'LOAD_TODOS' });
    try {
      const todos = await api.getTodos();
      dispatch({ type: 'LOAD_TODOS_SUCCESS', payload: todos });
    } catch {
      dispatch({
        type: 'LOAD_TODOS_FAILURE',
        payload: 'Unable to load your todos',
      });
    }
  }, []);

  const createTodo = useCallback(
    async (description: string): Promise<string | null> => {
      const tempId = crypto.randomUUID();
      dispatch({ type: 'CREATE_TODO', payload: { tempId, description } });
      try {
        const todo = await api.createTodo(description);
        dispatch({ type: 'CREATE_TODO_SUCCESS', payload: { tempId, todo } });
        return null;
      } catch {
        dispatch({
          type: 'CREATE_TODO_FAILURE',
          payload: { tempId, error: "Couldn't save that — try again" },
        });
        return description;
      }
    },
    [],
  );

  const clearError = useCallback((id?: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: id ? { id } : undefined });
  }, []);

  return { state, loadTodos, createTodo, clearError };
}
