import { UnknownError } from './constants';
import { Err, Ok } from './classes';
import type { IUnknownError } from './types';

/**
 * Creates an empty success result.
 * Used when an operation succeeds but returns no data.
 *
 * @returns An Ok result with undefined data
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * const result = ok();
 * // { success: true, data: undefined }
 * ```
 */
export function ok(): Ok;

/**
 * Creates a success result containing data.
 * Used to wrap successful operation results.
 *
 * @template T - Type of the data to wrap
 * @param data - The data to wrap in the success result
 * @returns An Ok result containing the data
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * const result = ok(42);
 * // { success: true, data: 42 }
 *
 * const user = { id: 1, name: 'John' };
 * const userResult = ok(user);
 * // { success: true, data: { id: 1, name: 'John' } }
 * ```
 */
export function ok<T>(data: T): Ok<T>;
export function ok<T = undefined>(data: T = undefined as T): Ok<T> {
  return new Ok(data);
}

/**
 * Creates an error result with unknown error type.
 * Used when an operation fails without specific error information.
 *
 * @returns An Err result with 'unknown' error
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err();
 * // { success: false, error: 'unknown', reason: undefined }
 * ```
 */
export function err(): Err<IUnknownError>;

/**
 * Creates an error result with a specific error type.
 * Used when an operation fails with a known error identifier.
 *
 * @template E - String literal type for the error identifier
 * @param error - The error identifier string
 * @returns An Err result with the specified error
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err('NotFound');
 * // { success: false, error: 'NotFound', reason: undefined }
 * ```
 */
export function err<E extends string>(error: E): Err<E>;

/**
 * Creates an error result with an error type and reason.
 * Used when an operation fails and you want to provide additional context.
 *
 * @template E - String literal type for the error identifier
 * @template C - Type of the reason/additional error information
 * @param error - The error identifier string
 * @param reason - Additional information about the error
 * @returns An Err result with the specified error and reason
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err('Validation', 'Email is required');
 * // { success: false, error: 'Validation', reason: 'Email is required' }
 *
 * const errorWithObject = err('DatabaseError', { code: 500, message: 'Connection failed' });
 * // { success: false, error: 'DatabaseError', reason: { code: 500, message: 'Connection failed' } }
 * ```
 */
export function err<E extends string, C>(error: E, reason: C): Err<E, C>;
export function err<E extends string, C = never>(
  error: E = UnknownError as E,
  reason: C = undefined as C
): Err<E, C> {
  return new Err<E, C>(error, reason, err);
}

