import { UnknownError } from './constants';
import { Err, Ok } from './classes';
import type { IUnknownError } from './types';

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

