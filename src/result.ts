
export type IResultOk<T, E=undefined> = Result<T, E, true>;
export type IResultFail<E, T=undefined> = Result<T, E, false>;
export type IResult<T, E=unknown> = IResultOk<T, E> | IResultFail<E, T>;
export type IFuture<T, E=unknown> = Promise<IResult<T, E>>;

export class Result<T, E, K extends boolean> {
  protected readonly _result: T | E;
  protected readonly _success: K;

  get value(): this extends Result<infer T, E, false> ? T : never {
    if (!this._success) {
      return undefined as this extends Result<infer T, E, false> ? T : never;
    }
    return this._result as this extends Result<infer T, E, false> ? T : never;
  }

  get reason(): this extends Result<T, infer E, true> ? E : never {
    if (this._success) {
      return undefined as this extends Result<T, infer E, true> ? E : never;
    }
    return this._result as this extends Result<T, infer E, true> ? E : never;
  }

  isFail(): this is Result<undefined, E, false> {
    return !this._success;
  }

  isOk(): this is Result<T, undefined, true> {
    return this._success;
  }

  protected constructor(value: E, success: false);
  protected constructor(value: T, success: true);
  protected constructor(value: T | E, success: K) {
    this._result = value;
    this._success = success;
  }

  public orDefault<U = T>(defaultValue: U): T | U {
    if (!this._success) {
      return defaultValue;
    }

    return this._result as T;
  }

  public orElse<U = T>(fn: (error: E) => U): T | U {
    if (!this._success) {
      return fn(this._result as E);
    }

    return this._result as T;
  }

  public orThrow<E = string>(err?: E): T {
    if (this._success) {
      return this._result as T;
    }

    if (err !== undefined) {
      throw err;
    }

    throw this._result as E;
  }

  public andThen<U>(fn: (value: T) => U): IResult<U, E> {
    if (this._success) {
      return Result.ok<U, E>(fn(this._result as T));
    }

    return Result.fail<E, U>(this._result as E);
  }

  public unwrap(): this extends Result<infer T, E, false>
    ? [T, true]
    : [E, false];
    public unwrap(okValue: false): this extends Result<infer T, E, false>
    ? [T, false]
    : [E, true];
  public unwrap(okValue: true): this extends Result<infer T, E, false>
    ? [T, true]
    : [E, false];
  public unwrap(okValue: boolean): this extends Result<infer T, E, false>
    ? [T, boolean]
    : [E, boolean];
  public unwrap(okValue: boolean = true): this extends Result<infer T, E, false>
    ? [T, boolean]
    : [E, boolean] {
    return [this._result as T, (okValue === this._success) as boolean] as this extends Result<
      infer T,
      E,
      false
    >
      ? [T, true]
      : [E, false];
  }

  public static ok<T, E=undefined>(value: T): IResultOk<T, E> {
    return new Result(value, true) as unknown as IResultOk<T, E>;
  }

  public static fail<E, T=undefined>(error: E): IResultFail<E, T> {
    return new Result(error, false) as unknown as IResultFail<E, T>;
  }

  public static create<T, E>(
    value: T | E,
    isSuccess: boolean = true
  ): IResult<T, E> {
    if (isSuccess) {
      return Result.ok(value as T);
    }

    return Result.fail(value as E);
  }

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
export function ok<T, E=undefined>(value: T): IResultOk<T, E> {
  return Result.ok<T, E>(value);
}

/**
 * Creates an failed result
 * @param error Error to be wrapped
 * @returns An failed result
 * @example
 * const [value, reason, isError] = fail("error");
 */
export function fail<E, T=undefined>(error: E): IResultFail<E, T> {
  return Result.fail<E, T>(error);
}
