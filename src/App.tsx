/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import {
  deleteTodo,
  getTodos,
  patchTodo,
  postTodos,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';

type FilteringToDo = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filter, setFilter] = useState<FilteringToDo>('all');
  const [todoInputAddTodo, setTodoInputAddTodo] = useState<string>('');
  const [todoInputChangeTitle, setTodoInputChangeTitle] = useState<string>('');
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoId, setLoadingTodoId] = useState<number | null | number[]>(
    null,
  );
  // const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  const [currentIdForEditing, setCurrentIdForEditing] = useState<number | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const fetchedTodos = await getTodos();

        setTodos(fetchedTodos);
      } catch (error) {
        setErrorMessage('Unable to load todos');
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const activeTodos = todos.filter(todo => !todo.completed).length;

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key == 'Escape') {
        setCurrentIdForEditing(null);
      }
    };

    const handleClosinfEditingForm = () => {
      setCurrentIdForEditing(null);
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('click', handleClosinfEditingForm);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
      window.removeEventListener('click', handleClosinfEditingForm);
    };
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const addTodos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disableInput) {
      return;
    }

    const trimmedTitle = todoInputAddTodo.trim();

    if (trimmedTitle === '') {
      setErrorMessage('Title should not be empty');
      setTimeout(() => inputRef.current?.focus(), 0);

      return;
    }

    setDisableInput(true);

    setTempTodo({ id: 0, title: trimmedTitle, completed: false });

    try {
      const newTodo = await postTodos({
        title: trimmedTitle,
        completed: false,
      });

      setTodos(prev => [...prev, newTodo]);
      setTodoInputAddTodo('');
    } catch {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setDisableInput(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const TodoDeleteButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLButtonElement;
    const idCurrent = Number(target.getAttribute('value'));

    setLoadingTodoId(idCurrent);

    try {
      await deleteTodo(idCurrent);

      const updatedTodos = todos.filter(todo => todo.id !== idCurrent);

      setTodos(updatedTodos);

      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    if (completedTodos.length === 0) {
      return;
    }

    try {
      const results = await Promise.allSettled(
        completedTodos.map(todo => deleteTodo(Number(todo.id))),
      );

      const errors = results
        .map((result, index) =>
          result.status === 'rejected' ? completedTodos[index] : null,
        )
        .filter(todo => todo !== null);

      const remainingTodos = todos.filter(
        todo => !todo.completed || errors.includes(todo),
      );

      setTodos(remainingTodos);

      if (errors.length > 0) {
        setErrorMessage('Unable to delete a todo');
      }

      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    }
  };

  const changeStatus = async (e: React.MouseEvent<HTMLInputElement>) => {
    const todoId = Number(e.currentTarget.value);
    const todo = todos.find(t => t.id === todoId);

    if (todo) {
      try {
        setLoadingTodoId(todo.id as number);

        await patchTodo(todo.id as number, {
          ...todo,
          completed: !todo.completed,
        });

        setTodos(prevTodos =>
          prevTodos.map(t =>
            t.id === todoId ? { ...t, completed: !t.completed } : t,
          ),
        );
      } catch (error) {
        setErrorMessage('Unable to update a todo');
      } finally {
        setLoadingTodoId(null);
      }
    }
  };

  const toggleAllStatuses = async () => {
    if (!todos || todos.length === 0) {
      return;
    }

    const allCompleted = todos.every(todo => todo.completed);

    try {
      const todosForLoading = todos.map(todo => todo.id as number);

      if (allCompleted) {
        setLoadingTodoId(todosForLoading);
      } else {
        setLoadingTodoId(
          todos.filter(todo => !todo.completed).map(todo => todo.id as number),
        );
      }

      const updatedTodos = await Promise.all(
        todos.map(async todo => {
          if (allCompleted) {
            return patchTodo(todo.id as number, {
              completed: false,
            });
          } else if (!todo.completed) {
            return patchTodo(todo.id as number, {
              completed: true,
            });
          }

          return todo;
        }),
      );

      const resolvedTodos = await Promise.all(updatedTodos);

      setTodos(resolvedTodos as Todo[]);
    } catch (error) {
      setErrorMessage('Unable to toggle all todos');
    } finally {
      setLoadingTodoId(null);
    }
  };

  const changeTitle = async (
    id: number | undefined,
    e: React.MouseEvent<HTMLSpanElement>,
  ) => {
    e.preventDefault();
    const currentId = todos.find(todo => todo.id === id);

    setCurrentIdForEditing(currentId?.id as number);
    setTodoInputChangeTitle(currentId?.title as string);
  };

  const changeTitleRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = todoInputChangeTitle.trim();

    if (trimmedTitle === '') {
      try {
        setLoadingTodoId(currentIdForEditing as number);
        await deleteTodo(currentIdForEditing as number);

        setTodos(todos.filter(todo => todo.id !== currentIdForEditing));
        setCurrentIdForEditing(null);
      } catch {
        setTimeout(() => inputRef.current?.focus(), 0);
        setErrorMessage('Unable to delete a todo');
        setLoadingTodoId(null);
        setCurrentIdForEditing(null);
      } finally {
        setTimeout(() => inputRef.current?.focus(), 0);
      }

      return;
    }

    try {
      setLoadingTodoId(currentIdForEditing as number);

      const currentTodo = todos.find(todo => todo.title === trimmedTitle);

      if (currentTodo) {
        setCurrentIdForEditing(null);

        return;
      } else {
        const updatedTodo = await patchTodo(currentIdForEditing as number, {
          title: trimmedTitle,
        });

        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === currentIdForEditing ? updatedTodo : todo,
          ),
        );
      }

      setCurrentIdForEditing(null);
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setLoadingTodoId(null);
    }
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          toggleAllStatuses={toggleAllStatuses}
          addTodos={addTodos}
          todoInputAddTodo={todoInputAddTodo}
          setTodoInputAddTodo={setTodoInputAddTodo}
          disableInput={disableInput}
          inputRef={inputRef}
        />

        {todos.length > 0 && (
          <TodoList
            todos={todos}
            filteredTodos={filteredTodos}
            changeStatus={changeStatus}
            changeTitle={changeTitle}
            changeTitleRequest={changeTitleRequest}
            currentIdForEditing={currentIdForEditing}
            todoInputChangeTitle={todoInputChangeTitle}
            setTodoInputChangeTitle={setTodoInputChangeTitle}
            loadingTodoId={loadingTodoId}
            TodoDeleteButton={TodoDeleteButton}
            tempTodo={null}
            inputRef={inputRef}
          />
        )}

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

        {todos.length > 0 && (
          <Footer
            activeTodos={activeTodos}
            filter={filter}
            setFilter={setFilter}
            todos={todos}
            clearCompleted={clearCompleted}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        clearError={() => setErrorMessage('')}
      />
    </div>
  );
};
