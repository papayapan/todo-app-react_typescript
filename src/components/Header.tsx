import React from 'react';
import { Todo } from '../types/Todo';

type HeaderProps = {
  todos: Todo[];
  toggleAllStatuses: () => void;
  addTodos: (e: React.FormEvent) => void;
  todoInputAddTodo: string;
  setTodoInputAddTodo: (value: string) => void;
  disableInput: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const Header: React.FC<HeaderProps> = ({
  todos,
  toggleAllStatuses,
  addTodos,
  todoInputAddTodo,
  setTodoInputAddTodo,
  disableInput,
  inputRef,
}) => (
  <header className="todoapp__header">
    {todos.length > 0 && (
      <button
        type="button"
        className={`todoapp__toggle-all ${
          todos.every(todo => todo.completed) ? 'active' : ''
        }`}
        data-cy="ToggleAllButton"
        onClick={toggleAllStatuses}
      />
    )}
    <form onSubmit={addTodos}>
      <input
        autoFocus
        data-cy="NewTodoField"
        type="text"
        className="todoapp__new-todo"
        placeholder="What needs to be done?"
        onChange={e => setTodoInputAddTodo(e.target.value)}
        value={todoInputAddTodo}
        disabled={disableInput}
        ref={inputRef}
      />
    </form>
  </header>
);
