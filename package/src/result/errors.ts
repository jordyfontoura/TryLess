import type { IUnknownFailure } from './types';

/**
 * Constant representing an unknown error.
 *
 * @example
 * ```ts
 * import { UnknownError, err } from 'tryless';
 * const failure = err(UnknownError);
 * // { success: false, error: 'unknown' }
 * ```
 */
export const UnknownError = "unknown" as const;

/**
 * Constant representing an unwrap error.
 *
 * @example
 * ```ts
 * import { UnwrapError, err } from 'tryless';
 * const failure = err(UnwrapError);
 * // { success: false, error: 'unwrap' }
 */
export const UnwrapError = "unwrap" as const;

/**
 * Type of {@link UnknownError}.
 */
export type IUnknownError = typeof UnknownError;

/**
 * Custom error class for dealing with failures produced by this library.
 *
 * @example
 * ```ts
 * import { ResultError } from 'tryless';
 * throw new ResultError({ success: false, error: 'NotFound' });
 * ```
 */
export class ResultError extends Error {
  public static messageMap = (result: IUnknownFailure) => {
    let message = `ResultError: ${result.error}`;

    if (result.reason) {
      message += ` - ${String(result.reason)}`;
    }

    return message;
  };

  constructor(result: IUnknownFailure) {
    const message = ResultError.messageMap(result);

    super(message);

    this.name = "ResultError";
  }
}

export abstract class Result<T extends true | false> {
  public success: T;

  constructor(success: T) {
    this.success = success;
  }

  public abstract toString(): string;
}

export class Ok extends Result<true> {
  constructor() {
    super(true);
  }

  public toString(): string {
    return 'Success';
  }
}

export class OkData<T> extends Ok {
  public data: T;

  constructor(data: T) {
    super();

    this.data = data;
  }

  public toString(): string {
    return `Success<${this.data}>`;
  }
}

export class Err<E extends string> extends Result<false> {
  public error: E;
  public stack?: string;

  constructor(error: E) {
    super(false);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.error = error;
  }

  public toString(): string {
    return `${this.error}: ${this.stack}`;
  }
}

export class ErrReason<E extends string, R = unknown> extends Err<E> {
  public reason: R;

  constructor(error: E, reason: R) {
    super(error);

    this.reason = reason;
  }

  public toString(): string {
    return `${this.error}: ${this.reason} - ${this.stack}`;
  }
}