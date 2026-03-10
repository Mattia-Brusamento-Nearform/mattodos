export type Todo = {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  optimistic?: boolean;
  error?: string;
};

export type AppState = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
};

export type Action =
  | { type: 'LOAD_TODOS' }
  | { type: 'LOAD_TODOS_SUCCESS'; payload: Todo[] }
  | { type: 'LOAD_TODOS_FAILURE'; payload: string }
  | { type: 'CREATE_TODO'; payload: { tempId: string; description: string } }
  | { type: 'CREATE_TODO_SUCCESS'; payload: { tempId: string; todo: Todo } }
  | { type: 'CREATE_TODO_FAILURE'; payload: { tempId: string; error: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO_SUCCESS'; payload: Todo }
  | { type: 'TOGGLE_TODO_FAILURE'; payload: { id: string; error: string } }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'DELETE_TODO_SUCCESS'; payload: { id: string } }
  | { type: 'DELETE_TODO_FAILURE'; payload: { id: string; todo: Todo; error: string } }
  | { type: 'CLEAR_ERROR'; payload?: { id: string } };
