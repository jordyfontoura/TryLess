import type { UnknownError } from './constants';

/**
 * Type of {@link UnknownError}.
 */
export type IUnknownError = typeof UnknownError;

/**
 * Type representing an unknown success result.
 */
export type IUnknownOk = { success: true; data: unknown };

/**
 * Type representing an unknown error result.
 */
export type IUnknownErr = { success: false; error: string; reason: unknown, stack?: string };

/**
 * Type representing either an unknown success or error result.
 */
export type IUnknownOkErr = IUnknownOk | IUnknownErr;

