import type { IUnknownOkErr } from './result/types';
import { UnwrapErrorName } from './result/constants';
import { isNodeEnvironment, inspect } from './runtime';

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

  public resultStack?: string;

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
    if ("captureStackTrace" in Error && typeof Error.captureStackTrace === 'function') {
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

  /**
   * Custom inspect function for Node.js util.inspect.
   * Provides detailed error information including the reason when available.
   * Falls back to simple message in browser environments.
   *
   * @param depth - Current inspection depth
   * @param opts - Inspection options
   * @returns Formatted error message with reason details
   */
  [Symbol.for('nodejs.util.inspect.custom')](depth: number, opts: { depth: number | null }) {
    if (depth < 0) {
      return this.message;
    }

    let msg = this.message;

    if (this.reason) {
      if (isNodeEnvironment && inspect) {
        // Node.js environment - use util.inspect
        const newOpts = { ...opts, depth: opts.depth === null ? null : opts.depth - 1 };
        msg += `\n\nReason ${inspect(this.reason, newOpts)}`;
      } else {
        // Browser environment - use JSON.stringify fallback
        try {
          msg += `\n\nReason ${JSON.stringify(this.reason, null, 2)}`;
        } catch {
          msg += `\n\nReason ${String(this.reason)}`;
        }
      }
    }

    return msg;
  }
}
