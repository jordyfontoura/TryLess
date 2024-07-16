import { error, IResult, IResultPromise, success } from "./result";

/**
 * Converts an async function into a result async function
 * @param fn Async function to be converted
 * @returns A function that returns a promise that resolves to a result
 * @example
 * const fn = resultifyAsyncFunction(async (x) => x + 1);
 * const [value, reason, isError] = await fn(1);
 */
export function resultifyAsyncFunction<T, E = Error, Fn extends (...args: any) => any = () => void>(
  fn: Fn,
): (...args: Parameters<Fn>) => Promise<IResult<T, E>> {
  return (...args) => fn(...args).then(success, error) as Promise<IResult<T, E>>;
}

/**
 * Converts a function into a result function
 * @param fn Function to be converted
 * @returns A function that returns a result
 * @example
 * const fn = resultifyFunction((x) => x + 1);
 * const [value, reason, isError] = fn(1);
 */
export function resultifyFunction<T, E = Error, Fn extends (...args: any) => any = () => void>(
  fn: Fn,
): (...args: Parameters<Fn>) => IResult<T, E> {
  return (...args) => {
    try {
      return success(fn(...args));
    } catch (err) {
      return error(err) as IResult<T, E>;
    }
  };
}

/**
 * Converts a promise into a result promise
 * @param promise Promise to be converted
 * @returns A promise that resolves to a result
 * @example
 * const [value, reason, isError] = await resultifyPromise(fetch("https://example.com"));
 */
export function resultifyPromise<T, E = Error>(
  promise: Promise<T>,
): Promise<IResult<T, E>> {
  return promise.then(success, error) as Promise<IResult<T, E>>;
}


export function promiseAsResult<
  T = unknown,
  E = Error
>(promise: Promise<T>): IResultPromise<T, E> {
  const resultPromise = promise.then(
    success,
    error
  ) as Promise<IResult<T, E>>;

  return promiseResultAsResultPromise<T, E>(resultPromise);
};

export function promiseResultAsResultPromise<T, E = Error>(
  promise: Promise<IResult<T, E>>,
): IResultPromise<T, E> {
  const finalPromise = Object.assign(promise, {
    orDefault,
    orElse,
    orThrow,
    andThen,
  }) as IResultPromise<T, E>;

  return finalPromise;

  async function orDefault(defaultValue: T): Promise<T> {
    const result = await promise;
    return result.orDefault(defaultValue);
  }

  async function orElse<U = T>(fn: (error: E) => U | PromiseLike<U>): Promise<T | U> {
    const result = await promise;
    return result.orElse(fn);
  }

  async function orThrow(message?: string): Promise<T> {
    const result = await promise;
    return result.orThrow(message);
  }

  function andThen<U>(fn: (value: T) => U): IResultPromise<U, E> {
    const newPromise = promise.then((result) => result.andThen(fn)) as IResultPromise<U, E>;

    return promiseResultAsResultPromise(newPromise);
  }
}