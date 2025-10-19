import { inspect } from 'util';


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

export type IUnknownOk = Ok<unknown>;
export type IUnknownErr = Err<string, unknown>;
export type IUnknownOkErr = IUnknownOk | IUnknownErr;

export class UnwrapError extends Error {
  public error: string;
  public reason?: unknown;

  constructor(result: IUnknownOkErr, caller: (...args: unknown[]) => unknown, customMessage?: string, customError?: string) {
    let message = customMessage || `Could not unwrap result`;

    const error = customError || ('error' in result ? result.error : UnwrapErrorName);
    message += ` '${error}'`
    const obj: { stack?: string } = {}
    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(obj, caller);
    }
    message += obj.stack?.replace('Error\n', '\n');

    if ('stack' in result) {
      message += ` ${result.stack?.replace('Error\n', '\n\nError created at\n')}`;
    }
    super(message);

    this.stack = obj.stack;

    this.error = customError || ('error' in result ? result.error : UnwrapErrorName);
    if ("reason" in result) {
      this.reason = result.reason;
    }

    this.name = "UnwrapError";
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth: number, opts: { depth: number | null }) {
    if (depth < 0) {
      return this.message;
    }
    let msg = this.message;
    if (this.reason) {
      const newOpts = { ...opts, depth: opts.depth === null ? null : opts.depth - 1 };
      msg += `\n\nReason ${inspect(this.reason, newOpts)}`;
    }
    return msg;
  }
}

export abstract class Result<T extends true | false> {
  public success: T;

  constructor(success: T) {
    this.success = success;
  }

  public abstract unwrap(customError?: string): this extends { data: infer U } ? U : never;
  public abstract unwrapOr<U>(defaultValue: U): this extends { data: infer J } ? J : U;
  public abstract unwrapOrElse<U>(defaultValue: (result: this extends { success: false } ? this : never) => U): this extends { data: infer J } ? J : U;

  public abstract unwrapErr(customError?: string): this extends { error: string } ? this : never;
  public abstract unwrapErrOr<U>(defaultValue: U): this extends { error: string } ? this : U;
  public abstract unwrapErrOrElse<U>(defaultValue: (result: this extends { success: true } ? this : never) => U): this extends { error: string } ? this : U;

  public abstract expect<E extends string>(error: E, customError?: string): this extends { error: E } ? this : never;

  public abstract and<R extends IUnknownOkErr>(result: R): this extends { success: true } ? R : this;
  public abstract andThen<U extends IUnknownOkErr>(fn: (data: this extends { data: infer J } ? J : never) => U): this extends { data: unknown } ? U : this;
  public abstract or<R extends IUnknownOkErr>(result: R): this extends { success: false } ? R : this;
  public abstract orElse<R extends IUnknownErr>(fn: (errorResult: this extends { error: infer J } ? J : never) => R): this extends { error: string } ? R : this;
  public abstract map<U>(fn: (result: this) => U): U;

  public isOk(): this extends { success: true } ? true : false {
    return (this.success === true) as this extends { success: true } ? true : false;
  }
  public isErr(): this extends { success: false } ? true : false {
    return (this.success === false) as this extends { success: false } ? true : false;
  }

  public abstract toString(): string;
}



export class Ok<T = undefined> extends Result<true> {
  public data: T;

  constructor(data: T) {
    super(true);

    this.data = data;
  }

  public unwrap(): this extends { data: infer J } ? J : never {
    return this.data as unknown as this extends { data: infer J } ? J : never;
  }
  public unwrapOr<U>(): this extends { data: infer J } ? J : U {
    return this.data as unknown as this extends { data: infer J } ? J : U;
  }
  public unwrapOrElse<U>(): this extends { data: infer J } ? J : U {
    return this.data as unknown as this extends { data: infer J } ? J : U;
  }

  public unwrapErr(customError?: string): this extends { error: string } ? this : never {
    throw new UnwrapError(this, this.unwrapErr as (...args: unknown[]) => unknown, `Could not unwrap error`, customError);
  }
  public unwrapErrOr<U>(defaultValue: U): this extends { error: string; } ? this : U {
    return defaultValue as this extends { error: string; } ? this : U;
  }
  public unwrapErrOrElse<U>(defaultValue: (result: this extends { success: true } ? this : never) => U): this extends { error: string; } ? this : U {
    return defaultValue(this as this extends { success: true } ? this : never) as this extends { error: string; } ? this : U;
  }

  public expect<E extends string>(error: E, customError?: string): this extends { error: E } ? this : never {
    throw new UnwrapError(this, this.expect as (...args: unknown[]) => unknown, `Expected error ${error}, but got success`, customError);
  }

  public and<R extends IUnknownOkErr>(result: R): this extends { success: true; } ? R : this {
    return result as this extends { success: true; } ? R : this;
  }

  public andThen<U extends IUnknownOkErr>(fn: (data: this extends { data: infer J; } ? J : never) => U): this extends { data: unknown; } ? U : this {
    return fn(this.data as this extends { data: infer J; } ? J : never) as this extends { data: unknown; } ? U : this;
  }

  public or<R extends IUnknownOkErr>(): this extends { success: false; } ? R : this {
    return this as this extends { success: false; } ? R : this;
  }

  public orElse<R extends IUnknownErr>(): this extends { error: string; } ? R : this {
    return this as this extends { error: string; } ? R : this;
  }

  public map<U>(fn: (result: this) => U): U {
    return fn(this) as U;
  }

  public toString(): string {
    return `Success<${this.data}>`;
  }
}


export class Err<E extends string, R = undefined> extends Result<false> {
  public error: E;
  public reason: R;
  public stack?: string;

  constructor(error: E, reason: R, caller?: (...args: unknown[]) => unknown) {
    super(false);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, caller || this.constructor);
    }

    this.error = error;
    this.reason = reason;
  }

  public unwrap(customError?: string): this extends { data: infer U; } ? U : never {
    throw new UnwrapError(this, this.unwrap as (...args: unknown[]) => unknown, `Could not unwrap error`, customError);
  }
  public unwrapOr<U>(defaultValue: U): this extends { data: infer J; } ? J : U {
    return defaultValue as this extends { data: infer J; } ? J : U;
  }
  public unwrapOrElse<U>(defaultValue: (result: this extends { success: false } ? this : never) => U): this extends { data: infer J; } ? J : U {
    return defaultValue(this as this extends { success: false } ? this : never) as this extends { data: infer J; } ? J : U;
  }
  public unwrapErr(): this extends { error: string; } ? this : never {
    return this as this extends { error: string; } ? this : never;
  }
  public unwrapErrOr<U>(): this extends { error: string; } ? this : U {
    return this as this extends { error: string; } ? this : U;
  }
  public unwrapErrOrElse<U>(): this extends { error: string; } ? this : U {
    return this as this extends { error: string; } ? this : U;
  }
  public expect<U extends string>(error: U, customError?: string): this extends { error: U; } ? this : never {
    if (this.error as string === error) {
      return this as this extends { error: U; } ? this : never;
    }

    throw new UnwrapError(this, this.expect as (...args: unknown[]) => unknown, `Expected error ${error}, but got error ${this.error}`, customError);
  }

  public and<R extends IUnknownOkErr>(): this extends { success: true; } ? R : this {
    return this as this extends { success: true; } ? R : this;
  }

  public andThen<U extends IUnknownOkErr>(): this extends { data: unknown; } ? U : this {
    return this as this extends { data: unknown; } ? U : this;
  }

  public or<R extends IUnknownOkErr>(result: R): this extends { success: false; } ? R : this {
    return result as this extends { success: false; } ? R : this;
  }

  public orElse<R extends IUnknownErr>(fn: (errorResult: this extends { error: infer J; } ? J : never) => R): this extends { error: string; } ? R : this {
    return fn(this as this extends { error: infer J; } ? J : never) as this extends { error: string; } ? R : this;
  }

  public map<U>(fn: (result: this) => U): U {
    return fn(this) as U;
  }

  public toString(): string {
    return `${this.error}: ${this.reason} - ${this.stack}`;
  }
}
