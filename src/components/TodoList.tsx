import React from 'react';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/Todo';

type TodoListProps = {
  todos: Todo[];
  filteredTodos: Todo[];
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
  tempTodo: Todo | null;
  inputRef: React.RefObject<HTMLInputElement>;
};

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  filteredTodos,
  changeStatus,
  changeTitle,
  changeTitleRequest,
  currentIdForEditing,
  todoInputChangeTitle,
  setTodoInputChangeTitle,
  loadingTodoId,
  TodoDeleteButton,
  tempTodo,
  inputRef,
}) => (
  <section className="todoapp__main" data-cy="TodoList">
    {filteredTodos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        changeStatus={changeStatus}
        changeTitle={changeTitle}
        changeTitleRequest={changeTitleRequest}
        currentIdForEditing={currentIdForEditing}
        todoInputChangeTitle={todoInputChangeTitle}
        setTodoInputChangeTitle={setTodoInputChangeTitle}
        loadingTodoId={loadingTodoId}
        TodoDeleteButton={TodoDeleteButton}
        inputRef={inputRef}
      />
    ))}
    {tempTodo && (
      <div
        key={tempTodo.id}
        data-cy="Todo"
        className={`todo ${tempTodo.completed ? 'completed' : ''}`}
      >
        <label className="todo__status-label">
          <input
            data-cy="TodoStatus"
            type="checkbox"
            className="todo__status"
            checked={tempTodo.completed}
            disabled
          />
        </label>
        <span data-cy="TodoTitle" className="todo__title">
          {tempTodo.title}
        </span>
        <div data-cy="TodoLoader" className="modal overlay is-active">
          <div className="modal-background has-background-white-ter" />
          <div className="loader"></div>
        </div>
      </div>
    )}
  </section>
);
