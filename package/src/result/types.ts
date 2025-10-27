import type { Err, Ok } from './classes';
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


/**
 * Represents a result type that can be either a success (Ok) or an error (Err).
 * This type provides type-safe error handling without throwing exceptions.
 *
 * @template T - The type of the success value wrapped by Ok.
 * @template E - The error specification. Can be either:
 *   - An object mapping error names to their reason types: `{ ErrorName: ReasonType }`
 *   - A union of Err types: `Err<'ErrorName', ReasonType>`
 *   - IUnknownErr for generic error handling
 *
 * When using an object mapping, each key becomes an error name and its value
 * becomes the type of the error reason, automatically creating a union of Err types.
 *
 * @example
 * ```ts
 * // Using object mapping (recommended for multiple errors)
 * type UserResult = IResult<User, {
 *   NotFound: string;
 *   InvalidEmail: { email: string };
 *   Underage: { age: number };
 * }>;
 * // Equivalent to: Ok<User> | Err<'NotFound', string> | Err<'InvalidEmail', { email: string }> | Err<'Underage', { age: number }>
 *
 * function getUser(id: string): UserResult {
 *   if (!exists(id)) return err('NotFound', 'User not found');
 *   if (!validEmail(user.email)) return err('InvalidEmail', { email: user.email });
 *   if (user.age < 18) return err('Underage', { age: user.age });
 *   return ok(user);
 * }
 * ```
 *
 * @example
 * ```ts
 * // Using Err union (useful for single or reusable error types)
 * type ParseResult = IResult<number, Err<'ParseError', string>>;
 *
 * function parseNumber(input: string): ParseResult {
 *   const num = parseInt(input, 10);
 *   if (isNaN(num)) return err('ParseError', 'Invalid number format');
 *   return ok(num);
 * }
 * ```
 *
 * @example
 * ```ts
 * // Using IUnknownErr for generic error handling
 * import { resultfy } from 'tryless';
 * 
 * type GenericResult = IResult<Data, IUnknownErr>;
 *
 * async function fetchData(url: string): Promise<GenericResult> {
 *   return resultfy(
 *     fetch(url).then(r => r.json()),
 *     'FetchError'
 *   );
 * }
 * ```
 */
export type IResult<T, E extends IUnknownErr | { [key: string]: unknown }> =
  | Ok<T>
  | (
    E extends IUnknownErr ? E :
    { [K in keyof E]: Err<K & string, E[K]> }[keyof E]
  );


/**
 * Extracts the Ok type from a Result type.
 * If the type is not an Ok, returns never.
 *
 * @template T - The Result type to extract from
 *
 * @example
 * ```ts
 * type UserResult = IResult<User, { NotFound: string }>;
 * type UserOk = IOkOf<UserResult>;
 * // Result: Ok<User>
 *
 * // Useful for narrowing types in generic functions
 * function handleSuccess<T extends IResult<unknown, unknown>>(
 *   result: IOkOf<T>
 * ): IOkDataOf<T> {
 *   return result.data;
 * }
 * ```
 */
export type IOkOf<T> = T extends Ok<infer U> ? Ok<U> : never;

/**
 * Extracts the data type from an Ok type.
 * If the type is not an Ok, returns never.
 *
 * @template T - The Result type to extract data from
 *
 * @example
 * ```ts
 * type UserResult = IResult<User, { NotFound: string }>;
 * type UserData = IOkDataOf<UserResult>;
 * // Result: User
 *
 * // Useful for extracting success data types
 * type ApiResult = IResult<{ id: number; name: string }, IUnknownErr>;
 * type ApiData = IOkDataOf<ApiResult>;
 * // Result: { id: number; name: string }
 *
 * // In generic functions
 * function unwrapMany<T extends IResult<unknown, unknown>>(
 *   results: T[]
 * ): IOkDataOf<T>[] {
 *   return results
 *     .filter(r => r.isOk())
 *     .map(r => r.data as IOkDataOf<T>);
 * }
 * ```
 */
export type IOkDataOf<T> = T extends Ok<infer U> ? U : never;

/**
 * Extracts a specific Err type from a Result's error union by error name.
 * If K is provided, only returns the Err type with that specific name.
 * If the error name doesn't exist, returns never.
 *
 * @template E - The error union type
 * @template K - Optional error name to filter by (defaults to any string)
 *
 * @example
 * ```ts
 * type UserResult = IResult<User, {
 *   NotFound: string;
 *   InvalidEmail: { email: string };
 *   Underage: { age: number };
 * }>;
 *
 * // Extract specific error type
 * type NotFoundErr = IErrOf<UserResult, 'NotFound'>;
 * // Result: Err<'NotFound', string>
 *
 * type InvalidEmailErr = IErrOf<UserResult, 'InvalidEmail'>;
 * // Result: Err<'InvalidEmail', { email: string }>
 *
 * // Extract all error types
 * type AllErrs = IErrOf<UserResult>;
 * // Result: Err<'NotFound', string> | Err<'InvalidEmail', { email: string }> | Err<'Underage', { age: number }>
 *
 * // Useful for error handling functions
 * function handleNotFound(err: IErrOf<UserResult, 'NotFound'>) {
 *   console.log('User not found:', err.reason);
 * }
 * ```
 */
export type IErrOf<E, K extends string = string> = E extends Err<infer U, infer V>
  ? U extends K ? Err<U, V> : never
  : never;

/**
 * Extracts the reason type from an Err type.
 * If K is provided, only returns the reason type for that specific error name.
 *
 * @template E - The error union type
 * @template K - Optional error name to filter by (defaults to any string)
 *
 * @example
 * ```ts
 * type UserResult = IResult<User, {
 *   NotFound: string;
 *   InvalidEmail: { email: string };
 *   Underage: { age: number };
 * }>;
 *
 * // Extract reason type for specific error
 * type NotFoundReason = IErrReasonOf<UserResult, 'NotFound'>;
 * // Result: string
 *
 * type InvalidEmailReason = IErrReasonOf<UserResult, 'InvalidEmail'>;
 * // Result: { email: string }
 *
 * type UnderageReason = IErrReasonOf<UserResult, 'Underage'>;
 * // Result: { age: number }
 *
 * // Extract all possible reason types
 * type AllReasons = IErrReasonOf<UserResult>;
 * // Result: string | { email: string } | { age: number }
 *
 * // Useful for type-safe error handlers
 * function logInvalidEmail(reason: IErrReasonOf<UserResult, 'InvalidEmail'>) {
 *   console.log(`Invalid email: ${reason.email}`);
 *   // TypeScript knows reason has an 'email' property
 * }
 *
 * function logUnderage(reason: IErrReasonOf<UserResult, 'Underage'>) {
 *   console.log(`User is ${reason.age} years old`);
 *   // TypeScript knows reason has an 'age' property
 * }
 * ```
 */
export type IErrReasonOf<E, K extends string = string> = E extends Err<infer U, infer V>
  ? U extends K ? V : never
  : never;
