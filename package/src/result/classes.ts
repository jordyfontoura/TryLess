import type { IUnknownOkErr, IUnknownErr } from './types';
import { UnwrapError } from '../unwrap-error';

/**
 * Abstract base class for result types (Ok and Err).
 * Provides a common interface for success and error results with type-safe operations.
 *
 * @template T - Boolean literal type indicating success (true) or failure (false)
 */
export abstract class Result<T extends true | false> {
  public success: T;

  constructor(success: T) {
    this.success = success;
  }

  /**
   * Unwraps the result, returning the data if successful, or throwing if failed.
   *
   * @param customError - Optional custom error message
   * @returns The data contained in a success result
   * @throws {UnwrapError} If the result is an error
   */
  public abstract unwrap(customError?: string): this extends { data: infer U } ? U : never;

  /**
   * Returns the data if successful, or a default value if failed.
   *
   * @template U - Type of the default value
   * @param defaultValue - Value to return if result is an error
   * @returns The data or the default value
   */
  public abstract unwrapOr<U>(defaultValue: U): this extends { data: infer J } ? J : U;

  /**
   * Returns the data if successful, or computes a default value from a function if failed.
   *
   * @template U - Type of the computed default value
   * @param defaultValue - Function that computes the default value from the error result
   * @returns The data or the computed default value
   */
  public abstract unwrapOrElse<U>(defaultValue: (result: this extends { success: false } ? this : never) => U): this extends { data: infer J } ? J : U;

  /**
   * Unwraps an error result, returning it if it's an error, or throwing if it's a success.
   *
   * @param customError - Optional custom error message
   * @returns The error result
   * @throws {UnwrapError} If the result is a success
   */
  public abstract unwrapErr(customError?: string): this extends { error: string } ? this : never;

  /**
   * Returns the error result if failed, or a default value if successful.
   *
   * @template U - Type of the default value
   * @param defaultValue - Value to return if result is a success
   * @returns The error result or the default value
   */
  public abstract unwrapErrOr<U>(defaultValue: U): this extends { error: string } ? this : U;

  /**
   * Returns the error result if failed, or computes a default value from a function if successful.
   *
   * @template U - Type of the computed default value
   * @param defaultValue - Function that computes the default value from the success result
   * @returns The error result or the computed default value
   */
  public abstract unwrapErrOrElse<U>(defaultValue: (result: this extends { success: true } ? this : never) => U): this extends { error: string } ? this : U;

  /**
   * Asserts that the result has a specific error type.
   * Returns the result if it matches, throws otherwise.
   *
   * @template E - Expected error string literal type
   * @param error - Expected error string
   * @param customError - Optional custom error message
   * @returns The result if error matches
   * @throws {UnwrapError} If error doesn't match or result is successful
   */
  public abstract expect<E extends string>(error: E, customError?: string): this extends { error: E } ? this : never;

  /**
   * Returns the given result if this is successful, otherwise returns this error.
   * Logical AND operation for results.
   *
   * @template R - Type of the result to return
   * @param result - Result to return if this is successful
   * @returns The given result or this error
   */
  public abstract and<R extends IUnknownOkErr>(result: R): this extends { success: true } ? R : this;

  /**
   * Applies a function to the data if successful, otherwise returns this error.
   * Allows chaining operations on successful results.
   *
   * @template U - Type of result returned by the function
   * @param fn - Function to apply to the data
   * @returns Result from the function or this error
   */
  public abstract andThen<U extends IUnknownOkErr>(fn: (data: this extends { data: infer J } ? J : never) => U): this extends { data: unknown } ? U : this;

  /**
   * Returns this result if successful, otherwise returns the given result.
   * Logical OR operation for results.
   *
   * @template R - Type of the fallback result
   * @param result - Result to return if this is an error
   * @returns This result or the given result
   */
  public abstract or<R extends IUnknownOkErr>(result: R): this extends { success: false } ? R : this;

  /**
   * Returns this result if successful, otherwise applies a function to the error.
   * Allows recovering from errors.
   *
   * @template R - Type of result returned by the function
   * @param fn - Function to apply to the error
   * @returns This result or result from the function
   */
  public abstract orElse<R extends IUnknownErr>(fn: (errorResult: this extends { error: infer J } ? J : never) => R): this extends { error: string } ? R : this;

  /**
   * Applies a transformation function to this result.
   *
   * @template U - Return type of the transformation function
   * @param fn - Function to transform the result
   * @returns The transformed value
   */
  public abstract map<U>(fn: (result: this) => U): U;

  /**
   * Checks if this result represents a success.
   *
   * @returns True if successful, false otherwise
   */
  public isOk(): this extends { success: true } ? true : false {
    return (this.success === true) as this extends { success: true } ? true : false;
  }

  /**
   * Checks if this result represents an error.
   *
   * @returns True if error, false otherwise
   */
  public isErr(): this extends { success: false } ? true : false {
    return (this.success === false) as this extends { success: false } ? true : false;
  }

  /**
   * Converts the result to a string representation.
   *
   * @returns String representation of the result
   */
  public abstract toString(): string;
}

/**
 * Represents a successful result containing data.
 * This is returned by operations that complete successfully.
 *
 * @template T - Type of the data contained in the success result
 *
 * @example
 * ```ts
 * import { ok } from 'tryless';
 * const result = ok(42);
 * // result.success === true
 * // result.data === 42
 * ```
 */
export class Ok<T = undefined> extends Result<true> {
  public data: T;

  /**
   * Creates a new Ok instance.
   *
   * @param data - The data to wrap in the success result
   */
  constructor(data: T) {
    super(true);

    this.data = data;
  }

  /**
   * Returns the wrapped data.
   * This operation is safe because Ok always contains data.
   *
   * @returns The data contained in this result
   */
  public unwrap(): this extends { data: infer J } ? J : never {
    return this.data as unknown as this extends { data: infer J } ? J : never;
  }

  /**
   * Returns the wrapped data.
   * The default value is ignored for Ok results.
   *
   * @template U - Type of the default value (unused)
   * @returns The data contained in this result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unwrapOr<U>(_defaultValue: U): this extends { data: infer J } ? J : U {
    return this.data as unknown as this extends { data: infer J } ? J : U;
  }

  /**
   * Returns the wrapped data.
   * The default value function is not called for Ok results.
   *
   * @template U - Type of the computed value (unused)
   * @returns The data contained in this result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unwrapOrElse<U>(_defaultValue: (result: this extends { success: false } ? this : never) => U): this extends { data: infer J } ? J : U {
    return this.data as unknown as this extends { data: infer J } ? J : U;
  }

  /**
   * Attempts to unwrap as an error, but always throws because this is a success result.
   *
   * @param customError - Optional custom error message
   * @throws {UnwrapError} Always throws because Ok is not an error
   */
  public unwrapErr(customError?: string): this extends { error: string } ? this : never {
    throw new UnwrapError(this, this.unwrapErr as (...args: unknown[]) => unknown, `Could not unwrap error`, customError);
  }

  /**
   * Returns the default value because this is not an error result.
   *
   * @template U - Type of the default value
   * @param defaultValue - Value to return
   * @returns The default value
   */
  public unwrapErrOr<U>(defaultValue: U): this extends { error: string; } ? this : U {
    return defaultValue as this extends { error: string; } ? this : U;
  }

  /**
   * Computes and returns a default value because this is not an error result.
   *
   * @template U - Type of the computed value
   * @param defaultValue - Function to compute the default value
   * @returns The computed default value
   */
  public unwrapErrOrElse<U>(defaultValue: (result: this extends { success: true } ? this : never) => U): this extends { error: string; } ? this : U {
    return defaultValue(this as this extends { success: true } ? this : never) as this extends { error: string; } ? this : U;
  }

  /**
   * Asserts that this result is an error with a specific type.
   * Always throws because Ok is a success result.
   *
   * @template E - Expected error type
   * @param error - Expected error string
   * @param customError - Optional custom error message
   * @throws {UnwrapError} Always throws because Ok is not an error
   */
  public expect<E extends string>(error: E, customError?: string): this extends { error: E } ? this : never {
    throw new UnwrapError(this, this.expect as (...args: unknown[]) => unknown, `Expected error ${error}, but got success`, customError);
  }

  /**
   * Returns the given result because this is a success.
   * Implements the logical AND operation.
   *
   * @template R - Type of the result to return
   * @param result - Result to return
   * @returns The given result
   */
  public and<R extends IUnknownOkErr>(result: R): this extends { success: true; } ? R : this {
    return result as this extends { success: true; } ? R : this;
  }

  /**
   * Applies the function to the wrapped data.
   * Enables chaining of operations on successful results.
   *
   * @template U - Type of result returned by the function
   * @param fn - Function to apply to the data
   * @returns Result from the function
   */
  public andThen<U extends IUnknownOkErr>(fn: (data: this extends { data: infer J; } ? J : never) => U): this extends { data: unknown; } ? U : this {
    return fn(this.data as this extends { data: infer J; } ? J : never) as this extends { data: unknown; } ? U : this;
  }

  /**
   * Returns this result because it's already successful.
   * The alternative result is ignored.
   *
   * @template R - Type of the alternative result (unused)
   * @returns This result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public or<R extends IUnknownOkErr>(_result: R): this extends { success: false; } ? R : this {
    return this as this extends { success: false; } ? R : this;
  }

  /**
   * Returns this result because it's already successful.
   * The recovery function is not called.
   *
   * @template R - Type of result from recovery (unused)
   * @returns This result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public orElse<R extends IUnknownErr>(_fn: (errorResult: this extends { error: infer J; } ? J : never) => R): this extends { error: string; } ? R : this {
    return this as this extends { error: string; } ? R : this;
  }

  /**
   * Applies a transformation function to this result.
   *
   * @template U - Return type of the transformation
   * @param fn - Function to transform the result
   * @returns The transformed value
   */
  public map<U>(fn: (result: this) => U): U {
    return fn(this) as U;
  }

  /**
   * Returns a string representation of this success result.
   *
   * @returns String in format "Success<data>"
   */
  public toString(): string {
    return `Success<${this.data}>`;
  }
}

/**
 * Represents a failed result containing an error and optional reason.
 * This is returned by operations that fail or encounter errors.
 *
 * @template E - String literal type representing the error identifier
 * @template R - Type of the reason/additional error information
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 * const result = err('NotFound', 'User not found');
 * // result.success === false
 * // result.error === 'NotFound'
 * // result.reason === 'User not found'
 * ```
 */
export class Err<E extends string, R = undefined> extends Result<false> {
  public error: E;
  public reason: R;
  public stack?: string;

  /**
   * Creates a new Err instance.
   * Automatically captures a stack trace if available.
   *
   * @param error - The error identifier string
   * @param reason - Additional information about the error
   * @param caller - Optional function to exclude from stack trace
   */
  constructor(error: E, reason: R, caller?: (...args: unknown[]) => unknown) {
    super(false);

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, caller || this.constructor);
    }

    this.error = error;
    this.reason = reason;
  }

  /**
   * Attempts to unwrap the result, but always throws because this is an error.
   *
   * @param customError - Optional custom error message
   * @throws {UnwrapError} Always throws because Err contains no data
   */
  public unwrap(customError?: string): this extends { data: infer U; } ? U : never {
    throw new UnwrapError(this, this.unwrap as (...args: unknown[]) => unknown, `Could not unwrap error`, customError);
  }

  /**
   * Returns the default value because this is an error result.
   *
   * @template U - Type of the default value
   * @param defaultValue - Value to return
   * @returns The default value
   */
  public unwrapOr<U>(defaultValue: U): this extends { data: infer J; } ? J : U {
    return defaultValue as this extends { data: infer J; } ? J : U;
  }

  /**
   * Computes and returns a default value using this error result.
   *
   * @template U - Type of the computed value
   * @param defaultValue - Function to compute the default value from this error
   * @returns The computed default value
   */
  public unwrapOrElse<U>(defaultValue: (result: this extends { success: false } ? this : never) => U): this extends { data: infer J; } ? J : U {
    return defaultValue(this as this extends { success: false } ? this : never) as this extends { data: infer J; } ? J : U;
  }

  /**
   * Returns this error result.
   * This operation is safe because Err always contains an error.
   *
   * @returns This error result
   */
  public unwrapErr(): this extends { error: string; } ? this : never {
    return this as this extends { error: string; } ? this : never;
  }

  /**
   * Returns this error result.
   * The default value is ignored for Err results.
   *
   * @template U - Type of the default value (unused)
   * @returns This error result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unwrapErrOr<U>(_defaultValue: U): this extends { error: string; } ? this : U {
    return this as this extends { error: string; } ? this : U;
  }

  /**
   * Returns this error result.
   * The default value function is not called for Err results.
   *
   * @template U - Type of the computed value (unused)
   * @returns This error result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unwrapErrOrElse<U>(_defaultValue: (result: this extends { success: true } ? this : never) => U): this extends { error: string; } ? this : U {
    return this as this extends { error: string; } ? this : U;
  }

  /**
   * Asserts that this error matches the expected error type.
   * Returns this result if it matches, throws otherwise.
   *
   * @template U - Expected error string literal type
   * @param error - Expected error string
   * @param customError - Optional custom error message
   * @returns This result if error matches
   * @throws {UnwrapError} If error doesn't match
   */
  public expect<U extends string>(error: U, customError?: string): this extends { error: U; } ? this : never {
    if (this.error as string === error) {
      return this as this extends { error: U; } ? this : never;
    }

    throw new UnwrapError(this, this.expect as (...args: unknown[]) => unknown, `Expected error ${error}, but got error ${this.error}`, customError);
  }

  /**
   * Returns this error because it's not a success.
   * The alternative result is ignored.
   *
   * @template R - Type of the alternative result (unused)
   * @returns This error result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public and<R extends IUnknownOkErr>(_result: R): this extends { success: true; } ? R : this {
    return this as this extends { success: true; } ? R : this;
  }

  /**
   * Returns this error because it's not a success.
   * The function is not called.
   *
   * @template U - Type of result from function (unused)
   * @returns This error result
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public andThen<U extends IUnknownOkErr>(_fn: (data: this extends { data: infer J; } ? J : never) => U): this extends { data: unknown; } ? U : this {
    return this as this extends { data: unknown; } ? U : this;
  }

  /**
   * Returns the given result because this is an error.
   * Implements the logical OR operation for error recovery.
   *
   * @template R - Type of the fallback result
   * @param result - Result to return as fallback
   * @returns The given fallback result
   */
  public or<R extends IUnknownOkErr>(result: R): this extends { success: false; } ? R : this {
    return result as this extends { success: false; } ? R : this;
  }

  /**
   * Applies the function to this error for recovery.
   * Enables error handling and recovery patterns.
   *
   * @template R - Type of result returned by the function
   * @param fn - Function to handle the error
   * @returns Result from the recovery function
   */
  public orElse<R extends IUnknownErr>(fn: (errorResult: this extends { error: infer J; } ? J : never) => R): this extends { error: string; } ? R : this {
    return fn(this as this extends { error: infer J; } ? J : never) as this extends { error: string; } ? R : this;
  }

  /**
   * Applies a transformation function to this error result.
   *
   * @template U - Return type of the transformation
   * @param fn - Function to transform the result
   * @returns The transformed value
   */
  public map<U>(fn: (result: this) => U): U {
    return fn(this) as U;
  }

  /**
   * Returns a string representation of this error result.
   *
   * @returns String in format "error: reason - stack"
   */
  public toString(): string {
    return `${this.error}: ${this.reason} - ${this.stack}`;
  }
}

