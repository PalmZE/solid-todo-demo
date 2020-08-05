export type Result<E, A> =
  | { kind: "Error"; error: E }
  | { kind: "Success"; value: A };

export const map = <E, A, B>(
  fa: Result<E, A>,
  f: (a: A) => B
): Result<E, B> => {
  if (fa.kind === "Error") {
    return fa;
  }

  return { kind: "Success", value: f(fa.value) };
};

export const fold = <E, A, B>(
  fa: Result<E, A>,
  onError: () => B,
  onSuccess: (a: A) => B
): B => {
  if (fa.kind === "Error") {
    return onError();
  }

  return onSuccess(fa.value);
};

export type TaskResult<E, A> = () => Promise<Result<E, A>>;

export const fromPromise = <A>(
  runPromise: () => Promise<A>
): TaskResult<unknown, A> => {
  return () =>
    runPromise()
      .then((value): Result<unknown, A> => ({ kind: "Success", value }))
      .catch((error) => ({ kind: "Error", error }));
};
