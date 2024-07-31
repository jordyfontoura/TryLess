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
     * const [value, isError] = await fetch("https://example.com").asSafe().unwrap();
     *
     * if (isError) {
     *  console.error(reason);
     *  return;
     * }
     *
     * console.log(value);
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asSafe: T extends IResult<any, any>
      ? never
      : <E = unknown>() => IFuture<T, E>;

    /**
     * Returns a new promise that resolves to the value of the original promise, or a default value if the original promise resolves to an error.
     * @param defaultValue - The default value to return if the original promise resolves to an error.
     * @returns A new promise that resolves to the value of the original promise, or the default value if the original promise resolves to an error.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orDefault: T extends Result<infer X, any, boolean>
      ? X extends undefined ? <U>(defaultValue: U) => Promise<U> : <U>() => Promise<X | U>
      : never;

    /**
     * Returns a new promise that resolves to the value of the original promise, or applies a function to handle the error.
     * @param fn - The function to handle the error. It takes the error as a parameter and returns a value.
     * @returns A new promise that resolves to the value of the original promise, or the result of applying the function to handle the error.
     */
    orElse: T extends Result<infer X, infer Y, boolean>
      ? X extends undefined ? <U>(fn: (error: Y) => U | Promise<U>) => Promise<U> : <U>(fn: (error: Y) => U | Promise<U>) => Promise<X | U>
      : never;

    /**
     * Returns the value of the original promise, or throws an error if the original promise resolves to an error.
     * @param message - The message to include in the error if the original promise resolves to an error.
     * @returns The value of the original promise if it resolves to a value.
     */
    orThrow: T extends IResult<infer X, infer Y>
      ? Y extends undefined ? (err?: unknown | ((e: unknown) => unknown)) => Promise<X> : (err?: Y | ((e: Y) => unknown)) => Promise<never>
      : never;

    /**
     * Unwraps the value of the original promise and returns it along with a boolean indicating whether the value is an error.
     * @returns An array containing the value of the original promise, the error if the value is an error, and a boolean indicating whether the value is an error.
     */
    unwrap: T extends IResult<infer X, infer Y>
      ? X extends undefined
        ? () => Promise<[Y, false]>
        : () => Promise<[X, true]>
      : never;
  }
}

function asSafe<
  T = unknown,
  E = unknown
>(this: IFuture<T, E>): IFuture<T, E> {
  return Result.wrap(this) as IFuture<T, E>;
};

async function orDefault<U, T, E>(
  this: IFuture<T, E>,
  defaultValue: U
): Promise<T | U> {
  const result = await this;

  if (result instanceof Result) {
    return result.orDefault(defaultValue) as T | U;
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

  return result.unwrap(okValue) as [T, boolean] | [E, boolean];
}


Promise.prototype.asSafe = asSafe;
Promise.prototype.orElse = orElse;
Promise.prototype.orDefault = orDefault as (defaultValue?: unknown) => Promise<unknown>;
Promise.prototype.orThrow = orThrow as (err?: unknown) => Promise<never>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Promise.prototype.unwrap = unwrap as (okValue?: boolean) => Promise<any>;

export {};
