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

