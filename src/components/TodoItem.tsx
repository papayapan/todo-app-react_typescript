import React from 'react';
import { Todo } from '../types/Todo';

type TodoItemProps = {
  todo: Todo;
  changeStatus: (e: React.MouseEvent<HTMLInputElement>) => void;
  changeTitle: (
    id: number | undefined,
    e: React.MouseEvent<HTMLSpanElement>,
  ) => void;
  changeTitleRequest: (e: React.FormEvent) => void;
  currentIdForEditing: number | null;
  todoInputChangeTitle: string;
  setTodoInputChangeTitle: (value: string) => void;
  loadingTodoId: number | null | number[];
  TodoDeleteButton: (e: React.MouseEvent<HTMLButtonElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  changeStatus,
  changeTitle,
  changeTitleRequest,
  currentIdForEditing,
  todoInputChangeTitle,
  setTodoInputChangeTitle,
  loadingTodoId,
  TodoDeleteButton,
  inputRef,
}) => (
  <div data-cy="Todo" className={`todo ${todo.completed ? 'completed' : ''}`}>
    <label className="todo__status-label">
      <input
        data-cy="TodoStatus"
        type="checkbox"
        className="todo__status"
        checked={todo.completed}
        onClick={changeStatus}
        value={todo.id}
      />
    </label>
    {currentIdForEditing === todo.id ? (
      <form onBlur={changeTitleRequest} onSubmit={changeTitleRequest}>
        <input
          data-cy="TodoTitleField"
          type="text"
          className="todo__title-field"
          placeholder="Empty todo will be deleted"
          onChange={e => setTodoInputChangeTitle(e.target.value)}
          value={todoInputChangeTitle}
          ref={inputRef}
          autoFocus
        />
      </form>
    ) : (
      <>
        <span
          onDoubleClick={event => changeTitle(todo.id, event)}
          data-cy="TodoTitle"
          className="todo__title"
        >
          {todo.title}
        </span>
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={TodoDeleteButton}
          value={todo.id}
        >
          ×
        </button>
      </>
    )}
    <div
      data-cy="TodoLoader"
      className={`modal overlay ${
        loadingTodoId === Number(todo.id) ||
        (Array.isArray(loadingTodoId) &&
          loadingTodoId.includes(todo.id as number))
          ? 'is-active'
          : ''
      }`}
    >
      <div className="modal-background has-background-white-ter" />
      <div className="loader" />
    </div>
  </div>
);
