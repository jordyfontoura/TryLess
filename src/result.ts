export type IResultData<T, E, K> = [T, E, K];

export interface IResultOps<T, E> {
  orDefault: (defaultValue: T) => T;
  orElse: <U = T>(fn: (error: E) => U) => T | U;
  orThrow: (message?: string) => T;
  andThen: <U>(fn: (value: T) => U) => IResult<U, E>;
}

export interface IResultAsyncOps<T, E> {
  orDefault: (defaultValue: T) => Promise<T>;
  orElse: <U = T>(fn: (error: E) => U | PromiseLike<U>) => Promise<T | U>;
  orThrow: (message?: string) => Promise<T>;
  andThen: <U>(fn: (value: T) => U) => IResultPromise<U, E>;
}

export type IResultPromise<T, E> = Promise<IResult<T, E>> &
  IResultAsyncOps<T, E>;

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

export function createResult<T, E>(value: undefined, error: E): IResultError<E>;
export function createResult<T, E>(
  value: T,
  error: undefined
): IResultSuccess<T>;
export function createResult<T, E>(value: T, error: E): IResult<T, E> {
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
