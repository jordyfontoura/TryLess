export type IResultData<T, E, K> = [T, E, K];

export interface IResultOps<T, E> {
  orDefault: (defaultValue: T) => T;
  orElse: <U = T>(fn: (error: E) => U) => T | U;
  orThrow: <E=string>(error?: E) => T;
  andThen: <U>(fn: (value: T) => U) => Result<U, E>;
}

/**
 * Result type that contains a value, an error and a boolean indicating if it's an error
 * @param T Type of the value
 * @param E Type of the error
 * @returns A tuple with the value, the error and a boolean indicating if it's an error
 * @example
 * const value = someResultFunction(1).orDefault(2).andThen((value) => value + 1);
 */
export type Result<T, E> = (
  | IResultData<T, undefined, false>
  | IResultData<undefined, E, true>
) &
  IResultOps<T, E>;

export type IResultSuccess<T, E = unknown> = IResultData<T, undefined, false> &
  IResultOps<T, E>;
export type IResultError<E, T = unknown> = IResultData<undefined, E, true> &
  IResultOps<T, E>;

export function createResult<E>(value: undefined, error: E): IResultError<E>;
export function createResult<T>(
  value: T,
  error: undefined
): IResultSuccess<T>;
export function createResult<T, E>(value: T, error: E): Result<T, E> {
  let result: Result<T, E>;
  const ops: IResultOps<T, E> = {
    orDefault,
    orElse,
    orThrow,
    andThen,
  };

  if (error !== undefined) {
    result = Object.assign([undefined, error, true], ops) as Result<T, E>;
  } else {
    result = Object.assign([value, undefined, false], ops) as Result<T, E>;
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

  function orThrow<E=string>(err?: E): T {
    if (error === undefined) {
      return value;
    }

    if (err !== undefined) {
      throw err;
    }

    throw error;
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
  return createResult<T>(value, undefined) as IResultSuccess<T, E>;
}

/**
 * Creates an failed result
 * @param error Error to be wrapped
 * @returns An failed result
 * @example
 * const [value, reason, isError] = fail("error");
 */
export function fail<E, T = unknown>(error: E): IResultError<E, T> {
  return createResult<E>(undefined, error) as IResultError<E, T>;
}
