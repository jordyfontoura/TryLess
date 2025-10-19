import type { UnknownError } from './constants';

/**
 * Type alias for the {@link UnknownError} constant.
 * Represents the string literal type "unknown".
 */
export type IUnknownError = typeof UnknownError;

/**
 * Type representing a generic success result with unknown data.
 * Used internally for type-safe result handling when the data type is not specified.
 *
 * @property success - Always true for success results
 * @property data - The data contained in the success result
 */
export type IUnknownOk = { success: true; data: unknown };

/**
 * Type representing a generic error result with unknown reason.
 * Used internally for type-safe error handling when the error details are not specified.
 *
 * @property success - Always false for error results
 * @property error - The error identifier string
 * @property reason - Additional information about the error
 * @property stack - Optional stack trace of where the error was created
 */
export type IUnknownErr = { success: false; error: string; reason: unknown, stack?: string };

/**
 * Union type representing either a success or error result with unknown types.
 * Useful for generic result handling where specific types are not known.
 */
export type IUnknownOkErr = IUnknownOk | IUnknownErr;

