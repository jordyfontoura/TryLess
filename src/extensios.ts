import { Result, IFuture, IResult } from "./result";

declare global {
  /**
   * Represents a promise that may resolve to a value or an error.
   * @template T - The type of the value that the promise may resolve to.
   */
  interface Promise<T> {
    /**
     * Converts a promise into a result.
     * @returns A promise that resolves to a result.
     * @example
     * const [value, isError] = await fetch("https://example.com").asResult().unwrap();
     *
     * if (isError) {
     *  console.error(reason);
     *  return;
     * }
     *
     * console.log(value);
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asResult: T extends Result<any, any, boolean>
      ? never
      : <U = T, E = unknown>() => IFuture<U, E>;

    /**
     * Returns a new promise that resolves to the value of the original promise, or a default value if the original promise resolves to an error.
     * @param defaultValue - The default value to return if the original promise resolves to an error.
     * @returns A new promise that resolves to the value of the original promise, or the default value if the original promise resolves to an error.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orDefault: T extends Result<infer X, any, boolean>
      ? <U = X>(defaultValue: U) => Promise<X | U>
      : never;

    /**
     * Returns a new promise that resolves to the value of the original promise, or applies a function to handle the error.
     * @param fn - The function to handle the error. It takes the error as a parameter and returns a value.
     * @returns A new promise that resolves to the value of the original promise, or the result of applying the function to handle the error.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orElse: T extends Result<any, infer Y, boolean>
      ? <U>(fn: (error: Y) => U | Promise<U>) => Promise<U>
      : never;

    /**
     * Returns the value of the original promise, or throws an error if the original promise resolves to an error.
     * @param message - The message to include in the error if the original promise resolves to an error.
     * @returns The value of the original promise if it resolves to a value.
     */
    orThrow: T extends Result<infer X, infer Y, boolean>
      ? <E extends NonNullable<unknown>>(
          error?: E | ((e: Y) => E)
        ) => Promise<X>
      : never;

    /**
     * Returns a new promise that resolves to the result of applying a function to the value of the original promise.
     * @param fn - The function to apply to the value of the original promise. It takes the value as a parameter and returns a new value.
     * @returns A new promise that resolves to the result of applying the function to the value of the original promise.
     */
    andThen: T extends Result<infer X, infer E, boolean>
      ? <U>(fn: (value: X) => U | IResult<U> | IFuture<U>) => IFuture<U, E>
      : never;

    /**
     * Unwraps the value of the original promise and returns it along with a boolean indicating whether the value is an error.
     * @returns An array containing the value of the original promise, the error if the value is an error, and a boolean indicating whether the value is an error.
     */
    unwrap: T extends Result<infer X, infer E, boolean>
      ? (() => Promise<[X, true] | [E, false]>) &
          ((okValue: false) => Promise<[X, false] | [E, true]>)
      : never;

    /**
     * Unwraps the value of the original promise and returns it along with a boolean indicating whether the value is an error.
     * @returns An array containing the value of the original promise, the error if the value is an error, and a boolean indicating whether the value is an error.
     */
    unwrapAll: T extends Result<infer X, infer E, boolean>
      ? (() => Promise<[X, undefined, true] | [undefined, E, false]>) &
          ((
            okValue: false
          ) => Promise<[X, undefined, false] | [undefined, E, true]>)
      : never;
  }
}

Promise.prototype.asResult = function asResult<
  T = unknown,
  E = unknown
>(): IFuture<T, E> {
  return Result.wrap(this);
};

async function orDefault<U, T, E>(
  this: IFuture<T, E>,
  defaultValue: U
): Promise<T | U> {
  const result = await this;

  if (result instanceof Result) {
    return result.orDefault(defaultValue);
  }

  throw new Error(
    `Cannot apply orDefault to a promise that does not resolve to a result.`
  );
}

async function orElse<T, E>(
  this: IFuture<T, E>,
  fn: (error: E) => T | Promise<T>
): Promise<T> {
  const result = await this;

  if (!(result instanceof Result)) {
    throw new Error(
      `Cannot apply orElse to a promise that does not resolve to a result.`
    );
  }
  const [valueOrReason, isOk] = result.unwrap();

  if (!isOk) {
    return await fn(valueOrReason);
  }

  return valueOrReason;
};

async function orThrow<T, E extends NonNullable<unknown> = string>(
  this: IFuture<T, E>,
  err?: E | ((e: unknown) => E)
): Promise<T> {
  const result = await this;

  if (!(result instanceof Result)) {
    throw new Error(
      `Cannot apply orThrow to a promise that does not resolve to a result.`
    );
  }

  const [valueOrReason, isOk] = result.unwrap();

  if (isOk) {
    return valueOrReason;
  }

  if (typeof err === "function") {
    throw (err as (e: unknown) => E)(valueOrReason);
  }

  throw valueOrReason;
}

async function andThen<T, E, U>(
  this: IFuture<T, E>,
  fn: (value: T) => U | IResult<U> | Promise<U> | IFuture<U>
): IFuture<U> {
  const result = await this;

  if (!(result instanceof Result)) {
    throw new Error(
      `Cannot apply andThen to a promise that does not resolve to a result.`
    );
  }

  const [value, isOk] = result.unwrap();

  if (!isOk) {
    return Result.fail(value);
  }

  const next = fn(value);

  if (next instanceof Promise) {
    const nextResult = await next;

    if (nextResult instanceof Result) {
      return nextResult;
    }

    return Result.ok(nextResult);
  }

  if (next instanceof Result) {
    return next;
  }

  return Result.ok(next as U);
}

async function unwrap<T, E>(
  this: IFuture<T, E>,
  okValue: boolean = true
): Promise<[T, boolean] | [E, boolean]> {
  const result = await this;

  if (!(result instanceof Result)) {
    throw new Error(
      `Cannot apply unwrap to a promise that does not resolve to a result.`
    );
  }

  return result.unwrap(okValue);
}

async function unwrapAll<T, E>(
  this: IFuture<T, E>
): Promise<[T, undefined, true] | [undefined, E, false]>;
async function unwrapAll<T, E>(
  this: IFuture<T, E>,
  okValue: false
): Promise<[T, undefined, false] | [undefined, E, true]>;
async function unwrapAll<T, E>(
  this: IFuture<T, E>,
  okValue: boolean = true
): Promise<[T | undefined, E | undefined, boolean]> {
  const result = await this;

  if (!(result instanceof Result)) {
    throw new Error(
      `Cannot apply unwrapAll to a promise that does not resolve to a result.`
    );
  }

  return result.unwrapAll(okValue);
}

Promise.prototype.orElse = orElse;
Promise.prototype.orDefault = orDefault;
Promise.prototype.orThrow = orThrow;
Promise.prototype.andThen = andThen;
Promise.prototype.unwrap = unwrap;
Promise.prototype.unwrapAll = unwrapAll;

export {};
