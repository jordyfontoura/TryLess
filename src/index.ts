type IResultData<T, E, K> = [T, E, K];

interface IResultOps<T, E> {
  orDefault: (defaultValue: T) => T;
  orElse: <U = T>(fn: (error: E) => U) => T | U;
  orThrow: (message?: string) => T;
  andThen: <U>(fn: (value: T) => U) => IResult<U, E>;
}

/**
 * Result type that contains a value, an error and a boolean indicating if it's an error
 * @param T Type of the value
 * @param E Type of the error
 * @returns A tuple with the value, the error and a boolean indicating if it's an error
 * @example
 * const value = someResultFunction(1).orDefault(2).andThen((value) => value + 1);
 */
export type IResult<T, E> = (
  | IResultData<T, undefined, false>
  | IResultData<undefined, E, true>
) &
  IResultOps<T, E>;

export type IResultSuccess<T, E = unknown> = IResultData<T, undefined, false> &
  IResultOps<T, E>;
export type IResultError<E, T = unknown> = IResultData<undefined, E, true> &
  IResultOps<T, E>;

function createResult<T, E>(value: undefined, error: E): IResultError<E>;
function createResult<T, E>(value: T, error: undefined): IResultSuccess<T>;
function createResult<T, E>(value: T, error: E): IResult<T, E> {
  let result: IResult<T, E>;
  const ops: IResultOps<T, E> = {
    orDefault,
    orElse,
    orThrow,
    andThen,
  };

  if (error) {
    result = Object.assign([undefined, error, true], ops) as IResult<T, E>;
  } else {
    result = Object.assign([value, undefined, false], ops) as IResult<T, E>;
  }

  return result;

  function orDefault<U = T>(defaultValue: U): T | U {
    if (error) {
      return defaultValue;
    }

    return value;
  }

  function orElse<U = T>(fn: (error: E) => U): T | U {
    if (error) {
      return fn(error);
    }

    return value;
  }

  function orThrow(message?: string): T {
    if (error) {
      throw new Error(message || String(error));
    }

    return value;
  }

  function andThen<U>(
    fn: (value: T) => U
  ): IResultSuccess<U, E> | IResultError<E, U> {
    if (error !== undefined) {
      return result as unknown as IResultError<E, U>;
    }

    return success(fn(value)) as IResultSuccess<U, E>;
  }
}

/**
 * Creates a successful result
 * @param value Value to be wrapped
 * @returns A successful result
 * @example
 * const [value, reason, isError] = success(1);
 */
export function success<T, E = unknown>(value: T): IResultSuccess<T, E> {
  return createResult<T, E>(value, undefined) as IResultSuccess<T, E>;
}

/**
 * Creates an error result
 * @param error Error to be wrapped
 * @returns An error result
 * @example
 * const [value, reason, isError] = error("error");
 */
export function error<E, T = unknown>(error: E): IResultError<E, T> {
  return createResult<T, E>(undefined, error) as IResultError<E, T>;
}

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

declare global {
  interface Promise<T> {
    /**
     * Converts a promise into a result
     * @returns A promise that resolves to a result
     * @example
     * const [value, reason, isError] = await fetch("https://example.com").asResult();
     *
     * if (isError) {
     *  console.error(reason);
     *  return;
     * }
     *
     * console.log(value);
     */
    asResult<U = T, E = Error>(): Promise<IResult<U, E>>;
  }
}

Promise.prototype.asResult = function asResult<
  U = unknown,
  E = Error,
>(): Promise<IResult<U, E>> {
  return this.then(success, error) as Promise<IResult<U, E>>;
};
