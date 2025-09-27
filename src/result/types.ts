/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IUnknownError } from './errors';

/**
 * Represents a successful result without any data.
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * const result = ok();
 * // result => { success: true }
 * ```
 */
export type IEmptySuccess = { success: true };

/**
 * Represents an empty failure with the unknown error type.
 */
export type IEmptyFailure = { success: false; error: IUnknownError };

/**
 * Represents an empty failure with optional reason.
 */
export type IEmptyUnknownFailure = {
  success: false;
  error: IUnknownError;
  reason?: unknown;
};

/**
 * Represents a successful result with data of type T.
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * const result = ok(42);
 * // result => { success: true, data: 42 }
 * ```
 */
export type ISuccess<T> = { success: true; data: T };

/**
 * Represents a failure result with an error of type E.
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err('NotFound');
 * // result => { success: false, error: 'NotFound' }
 * ```
 */
export type IFailure<E extends string> = { success: false; error: E };

/**
 * Represents a failure with an error of type E and a reason of type R.
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err('Validation', 'Email is required');
 * // result => { success: false, error: 'Validation', reason: 'Email is required' }
 * ```
 */
export type IFailureWithReason<E extends string, R> = {
  success: false;
  error: E;
  reason: R;
};

/**
 * Extracts the failure types from a function's return type.
 */
export type IFailuresFromFunction<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R extends IFailureWithReason<infer E, infer F>
  ? IFailureWithReason<E, F>[]
  : R extends IFailure<infer E>
  ? IFailure<E>[]
  : never
  : never;

/**
 * Extracts the failure types from an array of strings.
 */
export type IFailuresFromArray<T extends readonly string[]> = IFailure<T[number]>[];

/**
 * Extracts the failure types from an object with string values.
 */
export type IFailuresFromObject<T extends Record<string, string>> = IFailure<T[keyof T]>[];

/**
 * Represents a successful result with optional unknown data.
 */
export type IUnknownSuccess = { success: true; data?: unknown };

/**
 * Represents a failure result with a string error and optional unknown reason.
 */
export type IUnknownFailure = { success: false; error: string; reason?: unknown };

/**
 * Result that can either be a success with data of type T or one of the specified failures.
 */
export type IResult<T, E extends IFailure<any>[]> = ISuccess<T> | E[number];

/**
 * Pick a failure type from a result type.
 */
export type IPickResultFailure<T extends IUnknownResult, E extends string> = T extends IFailure<E>
  ? T
  : never;

/**
 * Unknown result helper type.
 */
export type IUnknownResult<T = IUnknownError> = T extends IUnknownError
  ? IUnknownSuccess | IUnknownFailure
  : ISuccess<T> | IUnknownFailure;

/**
 * Extracts the success data type from a result type.
 */
export type IUnwrapSuccess<T> = T extends ISuccess<infer U> ? U : never;

/**
 * Extracts the error type from a failure result type.
 */
export type IUnwrapFailure<T> = T extends IFailure<infer U> ? U : never;

/**
 * Extracts the reason type from a failure result type with a reason.
 */
export type IUnwrapFailureWithReason<T> = T extends IFailureWithReason<any, infer R> ? R : never;

/**
 * Extracts the success data type from a result type or returns never for failures.
 */
export type IUnwrapResult<T> = T extends ISuccess<infer U>
  ? U
  : T extends IFailure<any>
  ? never
  : never;

// Internal exact helper
export type IExact<T> = T extends Readonly<infer U> ? U : never;

