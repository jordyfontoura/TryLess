/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnknownError } from './result/constants';
import { Err, Ok } from './result/classes';
import { ok } from './result/functions';
import type { IUnknownError } from './result/types';

/**
 * Type guard to check if a value is a PromiseLike object (thenable).
 * Follows the Promise/A+ specification: checks if value is not null and has a then method.
 *
 * @template T - Type of the resolved value
 * @param v - Value to check
 * @returns True if the value is a PromiseLike object
 *
 * @example
 * ```ts
 * const promise = Promise.resolve(42);
 * if (isThenable(promise)) {
 *   // TypeScript knows promise is PromiseLike<number>
 * }
 *
 * // Works with proxy promises too
 * const proxyPromise = { then: (resolve) => resolve(42) };
 * if (isThenable(proxyPromise)) {
 *   // TypeScript knows proxyPromise is PromiseLike<number>
 * }
 * ```
 */
function isThenable<T = unknown>(v: unknown): v is PromiseLike<T> {
  return (
    v !== null &&
    (typeof v === "object" || typeof v === "function") &&
    typeof (v as any).then === "function"
  );
}

/**
 * Creates a curried function that transforms data and wraps it in a success result.
 * Useful for promise chains and function composition.
 *
 * @template T - Type of the input data
 * @template R - Type of the transformed data
 * @param map - Function to transform the input data
 * @returns A function that takes data, transforms it, and returns an Ok result
 *
 * @example
 * ```ts
 * import { okFulfilled } from 'tryless';
 *
 * // Simple transformation
 * const double = okFulfilled((n: number) => n * 2);
 * const result = double(5);
 * // { success: true, data: 10 }
 *
 * // Use in promise chains
 * fetch('https://api.example.com/user')
 *   .then(res => res.json())
 *   .then(okFulfilled(user => user.name))
 *   .then(result => {
 *     if (result.success) {
 *       console.log(result.data); // user name
 *     }
 *   });
 * ```
 */
export function okFulfilled<T, R = T>(map: (data: T) => R): (data: T) => Ok<R> {
  return (data) => ok(map(data));
}

/**
 * Creates a curried error factory that wraps rejection reasons in error results.
 * Particularly useful for converting promise rejections in complex chains.
 *
 * **Note:** For simple promise wrapping, prefer `resultfy()` which is more concise.
 *
 * @template E - String literal type for the error identifier
 * @param error - The error identifier to use for all rejections
 * @returns A function that takes a reason and returns an Err result
 *
 * @example
 * ```ts
 * import { errReject, ok, resultfy } from 'tryless';
 *
 * // Basic usage
 * const onReject = errReject('FetchError');
 * const result = onReject('Network down');
 * // { success: false, error: 'FetchError', reason: 'Network down' }
 *
 * // Use in complex promise chains
 * const userResult = await fetch('https://api.example.com/user')
 *   .then(ok, errReject('user:fetch-error'))
 *   .then(res => res.success ? res.data.json() : res)
 *   .then(ok, errReject('user:parse-error'));
 *
 * // For simpler cases, prefer resultfy:
 * const userResult = await resultfy(
 *   fetch('https://api.example.com/user'),
 *   'user:fetch-error'
 * );
 * ```
 */
export function errReject<E extends string>(error: E): (reason: unknown) => Err<E, unknown> {
  return function rejectWrapper(reason) {
    return new Err<E, unknown>(error, reason, rejectWrapper);
  };
}

/**
 * Wraps a function or promise to always return a result instead of throwing.
 * Converts both synchronous throws and promise rejections into error results.
 *
 * **Recommended approach** for wrapping promises and functions. More concise than `.then(ok, errReject())`.
 *
 * **For Promises:** Wraps a promise to return Ok on fulfillment or Err on rejection.
 *
 * **For Functions:** Returns a wrapped version that catches errors and returns results.
 *
 * @template F - Type of the function or promise to wrap
 * @param fn - The function or promise to wrap
 * @param error - Optional custom error identifier (defaults to 'unknown')
 * @returns Wrapped version that returns Result types
 *
 * @example
 * ```ts
 * import { resultfy } from 'tryless';
 *
 * // Wrap a promise with custom error message (most common use case)
 * const userResult = await resultfy(
 *   fetch('https://api.example.com/user').then(r => r.json()),
 *   'user:fetch-error'
 * );
 *
 * if (userResult.success) {
 *   console.log(userResult.data); // user data
 * } else {
 *   console.log(userResult.error); // 'user:fetch-error'
 *   console.log(userResult.reason); // rejection reason
 * }
 *
 * // Wrap a synchronous function
 * const divide = (a: number, b: number) => {
 *   if (b === 0) throw new Error('Division by zero');
 *   return a / b;
 * };
 *
 * const safeDivide = resultfy(divide, 'division-error');
 * const result1 = safeDivide(10, 2);
 * // { success: true, data: 5 }
 *
 * const result2 = safeDivide(10, 0);
 * // { success: false, error: 'division-error', reason: Error('Division by zero') }
 * ```
 */
/**
 * Wraps a promise to return Ok on fulfillment or Err with unknown error on rejection.
 *
 * @template F - Promise type to wrap
 * @param fn - The promise to wrap
 * @returns Promise that resolves to Ok or Err result
 */
export function resultfy<F extends Promise<any>>(
  fn: F
): Promise<Ok<Awaited<F>> | Err<IUnknownError, unknown>>;

/**
 * Wraps a promise to return Ok on fulfillment or Err with custom error on rejection.
 *
 * @template F - Promise type to wrap
 * @template E - String literal type for the error identifier
 * @param fn - The promise to wrap
 * @param error - Custom error identifier to use for rejections
 * @returns Promise that resolves to Ok or Err result
 */
export function resultfy<F extends Promise<any>, E extends string>(
  fn: F,
  error: E
): Promise<Ok<Awaited<F>> | Err<E, unknown>>;

/**
 * Wraps a function to catch errors and return results with unknown error.
 *
 * @template F - Function type to wrap
 * @param fn - The function to wrap
 * @returns Wrapped function that returns Result types
 */
export function resultfy<F extends (...args: any) => any>(
  fn: F
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => Err<IUnknownError, unknown>
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<Err<IUnknownError, unknown>>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<Ok<U> | Err<IUnknownError, unknown>>
  : (...args: Parameters<F>) => Ok<ReturnType<F>> | Err<IUnknownError, unknown>;

/**
 * Wraps a function to catch errors and return results with custom error.
 *
 * @template F - Function type to wrap
 * @template E - String literal type for the error identifier
 * @param fn - The function to wrap
 * @param error - Custom error identifier to use for errors
 * @returns Wrapped function that returns Result types
 */
export function resultfy<
  F extends (...args: any) => any,
  E extends string
>(
  fn: F,
  error: E
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => Err<E, unknown>
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<Err<E, unknown>>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<Ok<U> | Err<E, unknown>>
  : (...args: Parameters<F>) => Ok<ReturnType<F>> | Err<E, unknown>;
export function resultfy<F, E extends string>(
  fn: F,
  fnError?: E
): any {
  const error = fnError ?? UnknownError;
  if (isThenable(fn)) {
    return fn.then(ok, errReject(error));
  }

  if (typeof fn !== "function") {
    throw new Error("fn must be a function or a promise");
  }

  return (function wrapper(...args: any) {
    try {
      const result = (fn as (...args: any[]) => any)(...args);
      if (isThenable(result)) {
        return result.then(ok, (reason) => new Err<string, unknown>(error, reason, wrapper));
      }
      return ok(result);
    } catch (reason) {
      return new Err<string, unknown>(error, reason, wrapper);
    }
  }) as any;
}

