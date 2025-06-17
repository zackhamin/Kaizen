export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
  }
  
export interface TodoListProps {
    initialTodos?: TodoItem[];
    onTodosChange?: (todos: TodoItem[]) => void;
    theme: 'light' | 'dark';
    disabled?: boolean;
    maxItems?: number;
    placeholder?: string;
}