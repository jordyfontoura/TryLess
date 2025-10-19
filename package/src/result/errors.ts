import { None } from './functions';
import type { IUnknownFailure } from './types';

export type IExtractError<T> = T extends { error: infer E } ? E : never;
export type IExtractErrors<T> = T extends { error: infer E } ? E : never;

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
export const UnwrapErrorName = "unwrap" as const;

/**
 * Type of {@link UnknownError}.
 */
export type IUnknownError = typeof UnknownError;

export type IUnknownErr = Err<string> | ErrReason<string, unknown>;

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
    let message = `ResultError ${result.error}`;

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

export class UnwrapError extends Error {
  public error: string;
  public reason?: unknown;

  constructor(result: IUnknownErr, caller: (...args: unknown[]) => unknown) {
    let message = `Could not unwrap result`;
    if ('stack' in result) {
      message += ` ${result.stack?.replace('Error\n', '\n')}`;
    }
    super(message);

    this.error = result.error;
    if ("reason" in result) {
      this.reason = result.reason;
    }

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, caller);
    }

    this.name = "UnwrapError";
  }
}

export abstract class Result<T extends true | false> {
  public success: T;

  constructor(success: T) {
    this.success = success;
  }

  public abstract unwrap(customError?: string): this extends { data: infer U } ? U : never;
  public abstract unwrapOr<U>(defaultValue: U, customError?: string): this extends { data: infer J } ? J : U;
  public abstract unwrapOrElse<U>(defaultValue: () => U, customError?: string): this extends { data: infer J } ? J : U;

  public abstract unwrapErr(customError?: string): this extends { error: string } ? this : never;
  public abstract unwrapErrOr<U>(defaultValue: U, customError?: string): this extends { error: string } ? this : U;
  public abstract unwrapErrOrElse<U>(defaultValue: () => U, customError?: string): this extends { error: string } ? this : U;

  public abstract expect<E extends string>(error: E, customError?: string): this extends { error: E } ? this : never;

  public abstract andThen<U>(fn: (data: this extends { data: infer J } ? J : never) => U, customError?: string): this extends { data: unknown } ? OkData<U> : this;
  public abstract orCatch<E extends IUnknownErr>(fn: (errorResult: this extends { error: infer J } ? this : never) => E, customError?: string): this extends { error: string } ? E : this;
  public abstract map<U>(fn: (result: this) => U, customError?: string): U;

  public isOk(): this extends { success: true } ? true : false {
    return (this.success === true) as this extends { success: true } ? true : false;
  }
  public isErr(): this extends { success: false } ? true : false {
    return (this.success === false) as this extends { success: false } ? true : false;
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

export class OkData<T> extends Result<true> {
  public data: T;

  constructor(data: T) {
    super(true);

    this.data = data;
  }

  public toString(): string {
    return `Success<${this.data}>`;
  }
}

export class Err<E extends string> extends Result<false> {
  public error: E;
  public stack?: string;

  constructor(error: E, caller?: (...args: unknown[]) => unknown) {
    super(false);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, caller || this.constructor);
    }

    this.error = error;
  }

  public toString(): string {
    return `${this.error}: ${this.stack}`;
  }
}

export class ErrReason<E extends string, R = unknown> extends Err<E> {
  public reason: R;

  constructor(error: E, reason: R, caller?: (...args: unknown[]) => unknown) {
    super(error, caller);

    this.reason = reason;
  }

  public toString(): string {
    return `${this.error}: ${this.reason} - ${this.stack}`;
  }
}