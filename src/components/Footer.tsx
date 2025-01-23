import React from 'react';
import { Todo } from '../types/Todo';

type FooterProps = {
  activeTodos: number;
  filter: string;
  setFilter: (value: 'all' | 'active' | 'completed') => void;
  todos: Todo[];
  clearCompleted: () => void;
};

export const Footer: React.FC<FooterProps> = ({
  activeTodos,
  filter,
  setFilter,
  todos,
  clearCompleted,
}) => (
  <footer className="todoapp__footer" data-cy="Footer">
    <span className="todo-count" data-cy="TodosCounter">
      {activeTodos} {activeTodos === 1 ? 'item' : 'items'} left
    </span>

    <nav className="filter" data-cy="Filter">
      <a
        href="#/"
        className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
        data-cy="FilterLinkAll"
        onClick={() => setFilter('all')}
      >
        All
      </a>

      <a
        href="#/active"
        className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
        data-cy="FilterLinkActive"
        onClick={() => setFilter('active')}
      >
        Active
      </a>

      <a
        href="#/completed"
        className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
        data-cy="FilterLinkCompleted"
        onClick={() => setFilter('completed')}
      >
        Completed
      </a>
    </nav>

    <button
      type="button"
      className="todoapp__clear-completed"
      data-cy="ClearCompletedButton"
      disabled={todos.every(todo => !todo.completed)}
      onClick={clearCompleted}
    >
      Clear completed
    </button>
  </footer>
);
