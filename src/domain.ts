import { ask, combineReader, Reader } from "./reader";
import { fromPromise, TaskResult } from "./result";

//#region Model
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
export const todoModel = {
  complete: (todo: Todo): Todo => ({ ...todo, completed: true }),
  uncomplete: (todo: Todo): Todo => ({ ...todo, completed: false }),
  new: (title: string): Todo => ({
    id: new Date().getTime(),
    title,
    completed: false,
  }),
};
//#endregion

//#region Repo
interface ApiTodo extends Todo {
  userId: number;
}

export interface TodosRepo {
  getTodosForUesr: (userId: number) => TaskResult<unknown, Todo[]>;
}
export const todosRepo: Reader<{}, TodosRepo> = () => ({
  getTodosForUesr: (userId) =>
    fromPromise(() =>
      fetch("https://jsonplaceholder.typicode.com/todos")
        .then((response) => response.json())
        .then((todos: ApiTodo[]) =>
          todos.filter((todo) => todo.userId === userId)
        )
    ),
});
//#endregion

//#region Service
// same stuff for testing purposes
export interface TodosService {
  getTodosForUesr: (userId: number) => TaskResult<unknown, Todo[]>;
}

export const todosService = combineReader(
  ask<{ todosRepo: TodosRepo }>(),
  ([{ todosRepo }]): TodosService => ({
    getTodosForUesr: todosRepo.getTodosForUesr,
  })
);
//#endregion
