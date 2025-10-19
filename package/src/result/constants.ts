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

