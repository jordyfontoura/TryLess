// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type IResultOk<T, E = undefined> = Result<T, undefined, true>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type IResultFail<E, T = undefined> = Result<undefined, E, false>;
export type IResult<T, E = unknown> = IResultOk<T, E> | IResultFail<E, T>;
export type IFuture<T, E = unknown> = Promise<IResult<T, E>>;

/**
 * Represents a result that can either be a success or a failure.
 * @typeparam T - The type of the success value.
 * @typeparam E - The type of the failure value.
 * @typeparam K - A boolean type indicating whether the result is a success or a failure.
 */
export class Result<T, E, K extends boolean> {
  protected readonly _result: T | E;
  public readonly success: K;

  /**
   * Gets the value of the result if it is a success.
   * @returns The success value.
   */
  get data(): T extends undefined ? undefined : T {
    if (!this.success) {
      return undefined as T extends undefined ? undefined : T;
    }
    return this._result as T extends undefined ? undefined : T;
  }

  /**
   * Gets the reason of the result if it is a failure.
   * @returns The failure reason.
   */
  get error(): E extends undefined ? undefined : E {
    if (this.success) {
      return undefined as E extends undefined ? undefined : E;
    }
    return this._result as E extends undefined ? undefined : E;
  }

  /**
   * Checks if the result is a failure.
   * @returns True if the result is a failure, false otherwise.
   */
  isError(): this is E extends undefined ? never : Result<undefined, E, false> {
    return !this.success;
  }

  /**
   * Checks if the result is a success.
   * @returns True if the result is a success, false otherwise.
   */
  isOk(): this is T extends undefined ? never : Result<T, undefined, true> {
    return this.success;
  }

  /**
   * Constructs a new Result instance.
   * @param value - The value of the result.
   * @param success - A boolean indicating whether the result is a success or a failure.
   */
  protected constructor(value: E, success: false);
  protected constructor(value: T, success: true);
  protected constructor(value: T | E, success: K) {
    this._result = value;
    this.success = success;
  }

  /**
   * Returns the value of the result if it is a success, otherwise returns a default value.
   * @param defaultValue - The default value to return if the result is a failure.
   * @returns The success value or the default value.
   */
  public orDefault<U = T>(defaultValue: U): T | U {
    if (!this.success) {
      return defaultValue;
    }

    return this._result as T;
  }

  /**
   * Returns the value of the result if it is a success, otherwise applies a function to the failure reason and returns its result.
   * @param fn - The function to apply to the failure reason.
   * @returns The success value or the result of the function applied to the failure reason.
   */
  public orElse<U = T>(fn: (error: E) => U): T | U {
    if (!this.success) {
      return fn(this._result as E);
    }

    return this._result as T;
  }

  /**
   * Returns the value of the result if it is a success, otherwise throws an error.
   * @param err - The error to throw if the result is a failure.
   * @returns The success value.
   * @throws The error if the result is a failure.
   */
  public orThrow<E = string>(err?: E): T {
    if (this.success) {
      return this._result as T;
    }

    if (err !== undefined) {
      throw err;
    }

    throw this._result as E;
  }

  /**
   * Unwraps the result and returns its value along with a boolean indicating whether it is a success or a failure.
   * @param okValue - A boolean indicating whether the result is expected to be a success or a failure.
   * @returns An array containing the value and a boolean indicating success or failure.
   */
  public unwrap(): K extends true
    ? [T, true]
    : [E, false];
  public unwrap(
    okValue: false
  ): K extends true
    ? [T, false]
    : [E, true];
  public unwrap(
    okValue: true
  ): K extends true
    ? [T, true]
    : [E, false];
  public unwrap(
    okValue: boolean
  ): [T, boolean] | [E, boolean];
  public unwrap(
    okValue: boolean = true
  ): [T, boolean] | [E, boolean] {
    return [
      this._result as T | E,
      (okValue === this.success) as boolean,
    ] as this extends Result<infer T, E, false> ? [T, true] : [E, false];
  }

  /**
   * Creates a new Result instance representing a success.
   * @typeparam T - The type of the success value.
   * @typeparam E - The type of the failure value.
   * @param value - The success value.
   * @returns A new Result instance representing a success.
   */
  public static ok<T, E = undefined>(value: T): IResultOk<T, E> {
    return new Result(value, true) as unknown as IResultOk<T, E>;
  }

  /**
   * Creates a new Result instance representing a failure.
   * @typeparam T - The type of the success value.
   * @typeparam E - The type of the failure value.
   * @param error - The failure reason.
   * @returns A new Result instance representing a failure.
   */
  public static fail<E, T = undefined>(error: E): IResultFail<E, T> {
    return new Result(error, false) as unknown as IResultFail<E, T>;
  }

  /**
   * Creates a new Result instance based on the given value and success flag.
   * @typeparam T - The type of the success value.
   * @typeparam E - The type of the failure value.
   * @param value - The value of the result.
   * @param isSuccess - A boolean indicating whether the result is a success or a failure.
   * @returns A new Result instance.
   */
  public static create<T, E>(
    value: T | E,
    isSuccess: boolean = true
  ): IResult<T, E> {
    if (isSuccess) {
      return Result.ok(value as T);
    }

    return Result.fail(value as E);
  }

  /**
   * Wraps a function or a promise and returns a Result or a Future based on the result of the function or promise.
   * @typeparam T - The type of the success value.
   * @typeparam E - The type of the failure value.
   * @param fn - The function or promise to wrap.
   * @returns A Result or a Future based on the result of the function or promise.
   */
  public static wrap<T, E>(fn: Promise<T>): IFuture<T, E>;
  public static wrap<T, E>(fn: () => Promise<T>): IFuture<T, E>;
  public static wrap<T, E>(fn: () => T): IResult<T, E>;
  public static wrap<T, E>(
    fn: Promise<T> | (() => T | PromiseLike<T>)
  ): IResult<T, E> | IFuture<T, E> {
    if (fn instanceof Promise) {
      return fn.then(Result.ok, Result.fail) as IFuture<T, E>;
    }

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.then(Result.ok, Result.fail) as IFuture<T, E>;
      }

      return Result.ok(result) as IResult<T, E>;
    } catch (error) {
      return Result.fail(error) as IResult<T, E>;
    }
  }
}

/**
 * Creates a successful result
 * @param value Value to be wrapped
 * @returns A successful result
 * @example
 * const [value, reason, isError] = ok(1);
 */
export function ok<E = undefined>(): IResultOk<void, E>;
export function ok<T, E = undefined>(value: T): IResultOk<T, E>;
export function ok<T, E = undefined>(value?: T): IResultOk<T | void, E> {
  if (value === undefined) {
    return Result.ok<void, E>(undefined);
  }

  return Result.ok<T, E>(value);
}

/**
 * Creates an failed result
 * @param error Error to be wrapped
 * @returns An failed result
 * @example
 * const [value, reason, isError] = fail("error");
 */
export function fail<T = undefined>(): IResultFail<void, T>;
export function fail<E, T = undefined>(error: E): IResultFail<E, T>;
export function fail<E, T = undefined>(error?: E): IResultFail<E | void, T> {
  if (error === undefined) {
    return Result.fail<void, T>(undefined);
  }

  return Result.fail<E, T>(error);
}
