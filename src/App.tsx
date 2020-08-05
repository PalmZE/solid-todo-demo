import { createEffect, createSignal, createState, For, Show } from "solid-js";
import {
  Todo,
  todoModel,
  todosRepo,
  TodosService,
  todosService,
} from "./domain";
import { ask, combineReader } from "./reader";

interface State {
  todos: Todo[];
  isLoading: boolean;
}

interface ViewModel {
  state: State;

  onAddTodo: (title: string) => void;
  onTodoClick: (id: number) => void;
}

const viewModel = combineReader(
  ask<{ todosService: TodosService }>(),

  ([{ todosService }]): ViewModel => {
    const [state, setState] = createState<State>({
      todos: [],
      isLoading: true,
    });

    // Lenses for state is probably a good idea
    const onAddTodo = (title: string) =>
      setState({ todos: [todoModel.new(title), ...state.todos] });

    const onTodoClick = (id: number) =>
      setState({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? todo.completed
              ? todoModel.uncomplete(todo)
              : todoModel.complete(todo)
            : todo
        ),
      });

    createEffect(async () => {
      const todosResult = await todosService.getTodosForUesr(1)();

      if (todosResult.kind === "Success") {
        setState({ todos: todosResult.value });
      }

      setState({ isLoading: false });
    });

    return {
      state,
      onAddTodo,
      onTodoClick,
    };
  }
);

interface TodoFormProps {
  onAddTodo: (title: string) => void;
}
const TodoForm = (props: TodoFormProps) => {
  const [value, setValue] = createSignal("");

  const onSubmit = (e: FocusEvent) => {
    e.preventDefault();

    props.onAddTodo(value());
    setValue("");
  };

  const onInput = (e: { target: HTMLInputElement }) => {
    setValue(e.target.value);
  };

  return (
    <form onSubmit={onSubmit}>
      <input value={value()} onInput={onInput} />
      <button type="submit">Add todo</button>
    </form>
  );
};

interface TodoViewProps {
  todo: Todo;

  onTodoClick: (id: number) => void;
}
const TodoView = (props: TodoViewProps) => {
  const { todo, onTodoClick } = props;

  // Look console, it only rendered on mount and if changed
  console.log(todo.title);

  return (
    <div
      style={{
        display: "flex",
        cursor: "pointer",
      }}
      onClick={() => onTodoClick(todo.id)}
    >
      <span>{todo.completed ? "[X]" : "[O]"}</span>
      <span>{todo.title}</span>
    </div>
  );
};

const TodosView = (viewModel: ViewModel) => {
  return (
    <Show when={!viewModel.state.isLoading} fallback={<span>Loading...</span>}>
      <>
        <TodoForm onAddTodo={viewModel.onAddTodo} />
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "justify-content": "flex-start",
          }}
        >
          <For each={viewModel.state.todos}>
            {(item, ix) => (
              <div style={{ "margin-bottom": "8px" }}>
                <TodoView todo={item} onTodoClick={viewModel.onTodoClick} />
              </div>
            )}
          </For>
        </div>
      </>
    </Show>
  );
};

const TodosViewContainer = combineReader(
  ask<{ viewModel: ViewModel }>(),
  ([{ viewModel }]) => () => <TodosView {...viewModel} />
);

function App() {
  const _todosRepo = todosRepo({});
  const _todosService = todosService({ todosRepo: _todosRepo });
  const _viewModel = viewModel({ todosService: _todosService });
  const TodosView = TodosViewContainer({ viewModel: _viewModel });

  return (
    <div
      style={{
        "margin-top": "64px",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
      }}
    >
      <TodosView />
    </div>
  );
}

export default App;
