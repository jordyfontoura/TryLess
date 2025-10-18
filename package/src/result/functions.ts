/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnknownError, ResultError, UnwrapError, Err, ErrReason, Ok, OkData } from './errors';
import type { IUnknownError } from './errors';
import type {
  IEmptyFailure,
  IEmptySuccess,
  IEmptyUnknownFailure,
  IExact,
  IFailure,
  IFailureWithReason,
  IUnknownSuccess,
  IUnknownFailure,
  IUnknownResult,
  ISuccess,
  IUnwrapResult,
  IPickResultFailure,
} from './types';

const None = Symbol("None") as unknown;

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
export function ok<T>(data: T): OkData<T>;
export function ok<T>(data: T = None as T): Ok | OkData<T> {
  if (data === None) {
    return new Ok();
  }

  return new OkData(data);
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
export function err<E extends string, C>(error: E, reason: C): ErrReason<E, C>;
export function err<E extends string, C = never>(
  error: E = None as E,
  reason: C = None as C
): Err<E> | ErrReason<E, C> | Err<IUnknownError> {
  if (error === None) {
    return new Err<IUnknownError>(UnknownError)
  }

  if (reason === None) {
    return new Err<E>(error);
  }

  return new ErrReason<E, C>(error, reason);
}

/**
 * Format a result as a string.
 *
 * @example
 * ```ts
 * import { prettifyResult } from 'tryless';
 * const result = err('NotFound');
 * prettifyResult(result); // => 'Failure[NotFound]\nundefined'
 */
export function prettifyResult<R extends IUnknownResult>(result: R, transform?: (data: unknown) => string): string {
  if (result.success) {
    return `${transform ? transform(result.data) : result.data}`;
  }

  const stack = result.stack;
  const error = result.error;
  let reason = result.reason;

  if (isResult(result.reason)) {
    reason = prettifyResult(result.reason, transform);
  }

  if (stack) {
    if (reason) {
      return `[${error}] ${transform ? transform(reason) : reason}\n${stack}`;
    }

    return `[${error}]\n${stack}`;
  }

  if (reason) {
    return `[${error}] ${transform ? transform(reason) : reason}`;
  }

  return `[${error}]`;
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
export function okFulfilled<T, R = T>(map: (data: T) => R): (data: T) => OkData<R> {
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
export function errReject<E extends string>(error: E): (reason: unknown) => ErrReason<E, unknown> {
  return (reason) => err(error, reason);
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
): Promise<OkData<Awaited<F>> | ErrReason<IUnknownError, unknown>>;
export function resultfy<F extends Promise<any>, E extends { success: false }>(
  fn: F,
  onReject: (reason: unknown) => E
): Promise<OkData<Awaited<F>> | E>;
export function resultfy<F extends (...args: any) => any>(
  fn: F
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => ErrReason<IUnknownError, unknown>
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<ErrReason<IUnknownError, unknown>>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<OkData<U> | ErrReason<IUnknownError, unknown>>
  : (...args: Parameters<F>) => OkData<ReturnType<F>> | ErrReason<IUnknownError, unknown>;
export function resultfy<
  F extends (...args: any) => any,
  E extends { success: false }
>(
  fn: F,
  onReject: (reason: unknown) => E
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => E
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<E>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<OkData<U> | E>
  : (...args: Parameters<F>) => OkData<ReturnType<F>> | E;
export function resultfy<F, E extends { success: false }>(
  fn: F,
  onReject?: (reason: unknown) => E
): any {
  if (fn instanceof Promise) {
    return fn.then(ok, onReject || (errReject(UnknownError) as any));
  }

  if (typeof fn !== "function") {
    throw new Error("fn must be a function or a promise");
  }

  return ((...args: any) => {
    try {
      const result = (fn as (...args: any[]) => any)(...args);
      if (result instanceof Promise) {
        return result.then(ok, onReject || (errReject(UnknownError) as any));
      }
      return ok(result);
    } catch (reason) {
      return onReject ? onReject(reason) : err(UnknownError, reason);
    }
  }) as any;
}

/**
 * Extract value from a result or return a default/throw on failure.
 *
 * @example
 * ```ts
 * import { unwrap, ok, err } from 'tryless';
 * unwrap(ok(10)); // 10
 * unwrap(err('Fail'), 0); // 0
 * ```
 */
export function unwrap<T extends IUnknownResult, U>(result: T, defaultValue: U): T | U;
export function unwrap<T extends IUnknownResult, U = IUnwrapResult<T>>(result: T): U;
export function unwrap<T extends IUnknownResult, U = IUnwrapResult<T>>(result: T, defaultValue: U = None as any): T | U {
  if (result.success) {
    if ('data' in result) {
      return (result as { data: U }).data;
    }
    throw new ResultError({ success: false, error: UnwrapError, reason: result.data });
  }

  if (defaultValue !== None) {
    return defaultValue;
  }

  throw new ResultError(result);
}

/**
 * Extract a specific error from a result or throw when it does not match.
 *
 * @example
 * ```ts
 * import { unwrapError, err } from 'tryless';
 * const failure = err('NotFound');
 * const same = unwrapError(failure, 'NotFound');
 * // same.error === 'NotFound'
 * ```
 */
export function unwrapError<T extends IUnknownResult, U extends string>(
  result: T,
  error: U
): IExact<IPickResultFailure<T, U>> {
  if (result.success) {
    throw new ResultError(err('UnwrapError', result) as unknown as IUnknownFailure);
  }

  if ((result as any).error !== error) {
    throw new ResultError(result as IUnknownFailure);
  }

  return result as IExact<IPickResultFailure<T, U>>;
}

/**
 * Execute a matching callback based on result content.
 *
 * @example
 * ```ts
 * import { mapResult, ok, err } from 'tryless';
 * const value = mapResult(ok(5), {
 *   success: (n) => n * 2,
 *   default: () => 0,
 * });
 * // value === 10
 * ```
 */
export function mapResult<
  T extends IUnknownResult,
  C extends {
    [key in T extends IUnknownFailure ? (T & IUnknownFailure)['error'] : never]?: T extends IUnknownFailure
    ? (error: (T & IUnknownFailure)['error'], reason: (T & IUnknownFailure)['reason']) => unknown
    : never
  } & {
    success: T extends { success: true } ? (data: (T & { success: true })['data']) => any : never;
    default?: T extends IUnknownFailure ? (error: (T & IUnknownFailure)['error'], reason: (T & IUnknownFailure)['reason']) => unknown : never;
  }
>(result: T, cases: C): ReturnType<NonNullable<C[keyof C]>> {
  if (result.success) {
    return (cases as any).success((result as any).data);
  }

  const errorCase = (cases as any)[(result as any).error as keyof C];
  if (errorCase) {
    return errorCase((result as any).error, (result as any).reason) as ReturnType<NonNullable<C[keyof C]>>;
  }

  if ((cases as any).default) {
    return (cases as any).default((result as any).error, (result as any).reason) as ReturnType<NonNullable<C[keyof C]>>;
  }

  throw new ResultError(result as IUnknownFailure);
}

/**
 * Type guard for success results.
 */
export function isSuccess<T extends IUnknownResult>(result: T): result is Exclude<T, IUnknownFailure> {
  return (result as any).success === true;
}

/**
 * Type guard for failure results.
 */
export function isFailure<T extends IUnknownResult>(result: T): result is Exclude<T, IUnknownSuccess> {
  return (result as any).success === false;
}

export function isResult(result: unknown): result is IUnknownResult {
  return typeof result === 'object'
    && result !== null
    && 'success' in result
    && typeof result.success === 'boolean'
    && (result.success || 'error' in result && typeof result.error === 'string');
}

export function isFailureResult(result: unknown): result is IUnknownFailure {
  return isResult(result) && !result.success;
}

export function isSuccessResult(result: unknown): result is IUnknownSuccess {
  return isResult(result) && result.success;
}