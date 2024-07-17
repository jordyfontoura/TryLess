import { Future } from "./future";
import { Result } from "./result";
import { resultifyPromise } from "./utilities";

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
     * const [value, reason, isError] = await fetch("https://example.com").asResult();
     *
     * if (isError) {
     *  console.error(reason);
     *  return;
     * }
     *
     * console.log(value);
     */
    asResult: T extends Result<any, any> ? never : <U = T, E = Error>() => Future<U, E>;

    /**
     * Returns a new promise that resolves to the value of the original promise, or a default value if the original promise resolves to an error.
     * @param defaultValue - The default value to return if the original promise resolves to an error.
     * @returns A new promise that resolves to the value of the original promise, or the default value if the original promise resolves to an error.
     */
    orDefault: T extends Result<infer X, any> ? <U = X>(defaultValue: U) => Promise<X | U> : never;

    /**
     * Returns a new promise that resolves to the value of the original promise, or applies a function to handle the error.
     * @param fn - The function to handle the error. It takes the error as a parameter and returns a value.
     * @returns A new promise that resolves to the value of the original promise, or the result of applying the function to handle the error.
     */
    orElse: T extends Result<any, infer Y> ? <U>(fn: (error: Y) => U) => Promise<U> : never;

    /**
     * Returns the value of the original promise, or throws an error if the original promise resolves to an error.
     * @param message - The message to include in the error if the original promise resolves to an error.
     * @returns The value of the original promise if it resolves to a value.
     */
    orThrow: T extends Result<infer X, infer Y> ? <E extends Object>(error?: E | ((e: Y) => E)) => Promise<X> : never;

    /**
     * Returns a new promise that resolves to the result of applying a function to the value of the original promise.
     * @param fn - The function to apply to the value of the original promise. It takes the value as a parameter and returns a new value.
     * @returns A new promise that resolves to the result of applying the function to the value of the original promise.
     */
    andThen: T extends Result<infer X, infer E> ? <U>(fn: (value: X) => U) => Future<U, E> : never;
  }
}

Promise.prototype.asResult = function asResult<T = unknown, E = Error>(): Future<T, E> {
  return resultifyPromise(this);
}

Promise.prototype.orDefault = async function orDefault<T, U>(defaultValue: U): Promise<T | U> {
  const result = await this;

  if ('orDefault' in result) {
    return result.orDefault(defaultValue);
  }

  return result;
}

Promise.prototype.orElse = async function orElse<T, U>(fn: (error: T) => U): Promise<U> {
  const result = await this;

  if ('orElse' in result) {
    return result.orElse(fn);
  }

  return result;
}

Promise.prototype.orThrow = async function orThrow<T, E extends Object=string>(err?: E | ((e: any) => E)): Promise<T> {
  const [value, reason, isError] = await this;

  if (!isError) {
    return value;
  }

  if (typeof err === 'function') {
    throw err(reason);
  }

  throw reason;
}

Promise.prototype.andThen = async function andThen<T, U>(fn: (value: T) => U): Future<U> {
  const result = await this;

  if ('andThen' in result) {
    return result.andThen(fn);
  }

  return result;
}

export {};


