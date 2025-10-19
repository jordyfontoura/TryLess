/**
 * Constant representing an unknown error type.
 * Used as the default error value when no specific error is provided.
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
 * Constant representing an unwrap error type.
 * Used internally when unwrap operations fail.
 *
 * @example
 * ```ts
 * import { UnwrapErrorName } from 'tryless';
 * // Used internally by UnwrapError class
 * ```
 */
export const UnwrapErrorName = "unwrap" as const;

