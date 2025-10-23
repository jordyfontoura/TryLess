import type { IUnknownOkErr } from './result/types';
import { UnwrapErrorName } from './result/constants';

/**
 * Error thrown when attempting to unwrap a Result that contains an error,
 * or when expecting a specific error type that doesn't match.
 *
 * This error provides detailed stack traces showing both where the unwrap
 * was attempted and where the original error result was created.
 *
 * @example
 * ```ts
 * import { err } from 'tryless';
 *
 * const result = err('NotFound', 'User not found');
 * try {
 *   const data = result.unwrap(); // throws UnwrapError
 * } catch (error) {
 *   console.log(error.name); // 'UnwrapError'
 *   console.log(error.error); // 'NotFound'
 *   console.log(error.reason); // 'User not found'
 * }
 * ```
 */
export class UnwrapError extends Error {
  /**
   * The error identifier from the failed result.
   */
  public error: string;

  /**
   * Additional information about why the error occurred.
   */
  public reason?: unknown;

  /**
   * Creates a new UnwrapError instance.
   *
   * @param result - The result that failed to unwrap
   * @param caller - The function that attempted the unwrap (for stack trace)
   * @param customMessage - Optional custom error message
   * @param customError - Optional custom error identifier
   */
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
}

