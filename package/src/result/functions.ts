/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnknownError, Err, Ok } from './errors';
import type { IUnknownError } from './errors';

/**
 * Create an empty success result.
 */
export function ok(): Ok;
/**
 * Create a success result.
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * ok(); // => { success: true }
 * ok(42); // => { success: true, data: 42 }
 * ```
 */
export function ok<T>(data: T): Ok<T>;
export function ok<T = undefined>(data: T = undefined as T): Ok<T> {
  return new Ok(data);
}

/**
 * Create a failure result.
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * err(); // => { success: false, error: 'unknown' }
 * err('NotFound'); // => { success: false, error: 'NotFound' }
 * err('Validation', 'Email required');
 * // => { success: false, error: 'Validation', reason: 'Email required' }
 * ```
 */
export function err(): Err<IUnknownError>;
export function err<E extends string>(error: E): Err<E>;
export function err<E extends string, C>(error: E, reason: C): Err<E, C>;
export function err<E extends string, C = never>(
  error: E = UnknownError as E,
  reason: C = undefined as C
): Err<E, C> {
  return new Err<E, C>(error, reason, err);
}



/**
 * Curried mapper that returns a success result with transformed data.
 *
 * @example
 * ```ts
 * import { okFulfilled } from 'tryless';
 * const double = okFulfilled((n: number) => n * 2);
 * double(5); // => { success: true, data: 10 }
 * ```
 */
export function okFulfilled<T, R = T>(map: (data: T) => R): (data: T) => Ok<R> {
  return (data) => ok(map(data));
}

/**
 * Curried error factory that fixes the error label and accepts a reason later.
 *
 * @example
 * ```ts
 * import { errReject } from 'tryless';
 * const onReject = errReject('FetchError');
 * onReject('Network down');
 * // => { success: false, error: 'FetchError', reason: 'Network down' }
 * ```
 */
export function errReject<E extends string>(error: E): (reason: unknown) => Err<E, unknown> {
  return function rejectWrapper(reason) {
    return new Err<E, unknown>(error, reason, rejectWrapper);
  };
}

/**
 * Wrap a function or promise to always return a result.
 *
 * @example
 * ```ts
 * import { resultfy } from 'tryless';
 * const sum = (a: number, b: number) => a + b;
 * const safeSum = resultfy(sum);
 * safeSum(1, 2); // => { success: true, data: 3 }
 * ```
 */
export function resultfy<F extends Promise<any>>(
  fn: F
): Promise<Ok<Awaited<F>> | Err<IUnknownError, unknown>>;
export function resultfy<F extends Promise<any>, E extends string>(
  fn: F,
  error: E
): Promise<Ok<Awaited<F>> | Err<E, unknown>>;
export function resultfy<F extends (...args: any) => any>(
  fn: F
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => Err<IUnknownError, unknown>
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<Err<IUnknownError, unknown>>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<Ok<U> | Err<IUnknownError, unknown>>
  : (...args: Parameters<F>) => Ok<ReturnType<F>> | Err<IUnknownError, unknown>;
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
  if (fn instanceof Promise) {
    return fn.then(ok, errReject(error));
  }

  if (typeof fn !== "function") {
    throw new Error("fn must be a function or a promise");
  }

  return (function wrapper(...args: any) {
    try {
      const result = (fn as (...args: any[]) => any)(...args);
      if (result instanceof Promise) {
        return result.then(ok, (reason) => new Err<string, unknown>(error, reason, wrapper));
      }
      return ok(result);
    } catch (reason) {
      return new Err<string, unknown>(error, reason, wrapper);
    }
  }) as any;
}
