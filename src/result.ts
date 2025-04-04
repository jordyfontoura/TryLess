const None = Symbol("None") as unknown;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Represents a successful result without any data.
 */
export type IEmptySuccess = { success: true };
export type IEmptyFailure = { success: false; error: IUnknownError };
export type IEmptyUnknownFailure = {
  success: false;
  error: IUnknownError;
  reason?: unknown;
};

/**
 * Represents a successful result with data of type T.
 */
export type ISuccess<T> = { success: true; data: T };

/**
 * Represents a failure result with an error of type E.
 */
export type IFailure<E extends string> = { success: false; error: E };

/**
 * Represents a failure result with an error of type E and an additional reason of type R.
 */
export type IFailureWithReason<E extends string, R> = { success: false; error: E; reason: R };

/**
 * Extracts the failure types from a function's return type.
 */
export type IFailuresFromFunction<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R extends IFailureWithReason<infer E, infer F>
  ? IFailureWithReason<E, F>[]
  : R extends IFailure<infer E>
  ? IFailure<E>[]
  : never
  : never;

/**
 * Extracts the failure types from an array of strings.
 */
export type IFailuresFromArray<T extends readonly string[]> = IFailure<T[number]>[];

/**
 * Extracts the failure types from an object with string values.
 */
export type IFailuresFromObject<T extends Record<string, string>> = IFailure<T[keyof T]>[];

/**
 * Represents a successful result with optional unknown data.
 */
export type IUnknownSuccess = { success: true; data?: unknown };

/**
 * Represents a failure result with an error message and an optional reason of unknown type.
 */
export type IUnknownFailure = { success: false; error: string; reason?: unknown };

/**
 * A constant representing an unknown error.
 */
export const UnknownError = "unknown" as const;

/**
 * Represents the type of the UnknownError constant.
 */
export type IUnknownError = typeof UnknownError;

/**
 * Represents a result that can either be a success with data of type T or one of the specified failure types.
 */
export type IResult<T, E extends IFailure<any>[]> = ISuccess<T> | E[number];

/**
 * Pick a failure type from a result type.
 * @template T The result type.
 * @template E The error type.
 * @returns The failure type if it matches, otherwise never.
 */
export type IPickResultFailure<T extends IUnknownResult, E extends string> = T extends IFailure<E>
  ? T
  : never;

/**
 * Represents a result that can either be a success with data of type T or an unknown failure.
 */
export type IUnknownResult<T = IUnknownError> = T extends IUnknownError
  ? IUnknownSuccess | IUnknownFailure
  : ISuccess<T> | IUnknownFailure;

/**
 * Extracts the success data type from a result type.
 */
export type IUnwrapSuccess<T> = T extends ISuccess<infer U> ? U : never;

/**
 * Extracts the error type from a failure result type.
 */
export type IUnwrapFailure<T> = T extends IFailure<infer U> ? U : never;

/**
 * Extracts the reason type from a failure result type with a reason.
 */
export type IUnwrapFailureWithReason<T> = T extends IFailureWithReason<any, infer R> ? R : never;

/**
 * Extracts the success data type from a result type or returns never for failure types.
 */
export type IUnwrapResult<T> = T extends ISuccess<infer U>
  ? U
  : T extends IFailure<any>
  ? never
  : never;

type IExact<T> = T extends Readonly<infer U> ? U : never;

/**
 * Creates a success result with the given data.
 * @param data The data to be returned in the success result.
 * @returns A success result with the given data.
 */
export function ok<T>(data: T): IExact<ISuccess<T>>;

/**
 * Creates a success result without data.
 * @returns A success result without data.
 */
export function ok(): IExact<IEmptySuccess>;
export function ok<T>(data: T = None as T): IExact<ISuccess<T>> | IExact<IEmptySuccess> {
  if (data === None) {
    return { success: true };
  }

  return { success: true, data };
}

/**
 * Creates an error result without any error message or reason.
 * @returns An error result without any error message or reason.
 */
export function err(): IExact<IEmptyFailure>;
/**
 * Creates an error result with the given error message.
 * @param error The error message.
 * @returns An error result with the given error message.
 */
export function err<E extends string>(error: E): IExact<IFailure<E>>;
/**
 * Creates an error result with the given error message and optional reason.
 * @param error The error message.
 * @param reason The reason for the error.
 * @returns An error result with the given error message and reason.
 */
export function err<E extends string, C>(
  error: E,
  reason: C
): IExact<IFailureWithReason<E, C>>;
export function err<E extends string, C = never>(
  error: E = None as E,
  reason: C = None as C
): IExact<IFailure<E> | IEmptyFailure | IFailureWithReason<E, C>> {
  if (error === None) {
    return { success: false, error: UnknownError as E };
  }
  if (reason === None) {
    return { success: false, error };
  }

  return { success: false, error, reason };
}

/**
 * Creates a success result by applying a mapping function to the given data.
 * @param map The mapping function to be applied to the data.
 * @returns A function that takes data and returns a success result with the mapped data.
 */
export function okFulfilled<T, R = T>(
  map: (data: T) => R
): (data: T) => IExact<ISuccess<R>> {
  return (data) => ok(map(data));
}

/**
 * Creates an error result with the given error message and reason.
 * @param error The error message.
 * @returns A function that takes a reason and returns an error result with the given error message and reason.
 */
export function errReject<E extends string>(
  error: E
): (reason: unknown) => IExact<IFailureWithReason<E, unknown>> {
  return (reason) => err(error, reason);
}

/**
 * Wraps a function or a promise with a result type.
 * @param fn The function or promise to be wrapped.
 * @param onReject Optional function to handle rejection.
 * @returns A function that returns a result type.
 */
export function resultfy<F extends Promise<any>>(
  fn: F
): Promise<
  | IExact<ISuccess<Awaited<F>>>
  | IExact<IEmptyUnknownFailure>
>;

/**
 * Wraps a function or a promise with a result type and handles rejection.
 * @param fn The function or promise to be wrapped.
 * @param onReject Function to handle rejection.
 * @returns A function that returns a result type.
 */
export function resultfy<F extends Promise<any>, E extends { success: false }>(
  fn: F,
  onReject: (reason: unknown) => E
): Promise<{ success: true; data: Awaited<F> } | E>;

export function resultfy<F extends (...args: any) => any>(
  fn: F
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => {
    success: false;
    error: IUnknownError;
    reason: unknown;
  }
  : ReturnType<F> extends Promise<never>
  ? (
    ...args: Parameters<F>
  ) => Promise<IExact<IEmptyUnknownFailure>>
  : ReturnType<F> extends Promise<infer U>
  ? (
    ...args: Parameters<F>
  ) => Promise<
    | { success: true; data: U }
    | IExact<IEmptyUnknownFailure>
  >
  : (
    ...args: Parameters<F>
  ) =>
    | { success: true; data: ReturnType<F> }
    | IExact<IEmptyUnknownFailure>;


/**
 * Wraps a function or a promise with a result type and handles rejection.
 * @param fn The function or promise to be wrapped.
 * @param onReject Optional function to handle rejection.
 * @returns A function that returns a result type.
 */
export function resultfy<
  F extends (...args: any) => any,
  E extends { success: false }
>(
  fn: F,
  onReject: (reason: unknown) => E
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => E
  : ReturnType<F> extends Promise<never>
  ? (...args: Parameters<F>) => Promise<E>
  : ReturnType<F> extends Promise<infer U>
  ? (...args: Parameters<F>) => Promise<IExact<ISuccess<U>> | E>
  : (...args: Parameters<F>) => IExact<ISuccess<ReturnType<F>>> | E;

export function resultfy<F, E extends { success: false }>(
  fn: F,
  onReject?: (reason: unknown) => E
): any {
  if (fn instanceof Promise) {
    return fn.then(ok, onReject || (errReject(UnknownError) as any));
  }

  if (typeof fn !== "function") {
    throw new Error("fn must be a function or a promise");
  }

  return ((...args: any) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.then(ok, onReject || (errReject(UnknownError) as any));
      }
      return ok(result);
    } catch (reason) {
      return onReject ? onReject(reason) : err(UnknownError, reason);
    }
  }) as any;
}

/**
 * Unwraps the data from a result type.
 * @param result The result type to be unwrapped.
 * @param defaultValue The default value to return if the result is a failure.
 * @returns The unwrapped data or the default value.
 * @throws ResultError if the result is a failure and no default value is provided.
 */
export function unwrap<T extends IUnknownResult, U>(
  result: T,
  defaultValue: U
): T | U;
/**
 * Unwraps the data from a result type.
 * @param result The result type to be unwrapped.
 * @returns The unwrapped data or the default value.
 * @throws ResultError if the result is a failure and no default value is provided.
 */
export function unwrap<T extends IUnknownResult, U = IUnwrapResult<T>>(
  result: T
): U;
export function unwrap<T extends IUnknownResult, U = IUnwrapResult<T>>(
  result: T,
  defaultValue: U = None as any
): T | U {
  if (result.success) {
    return result.data as U;
  }

  if (defaultValue !== None) {
    return defaultValue;
  }

  throw new ResultError(result);
}

/**
 * Unwraps the error from a result type.
 * @param result The result type to be unwrapped.
 * @param error The expected error type.
 * @returns The unwrapped error or throws a ResultError if the result is a success or the error type does not match.
 * @throws ResultError if the result is a success or the error type does not match.
 */
export function unwrapError<T extends IUnknownResult, U extends string>(
  result: T,
  error: U,
): IExact<IPickResultFailure<T, U>> {
  if (result.success) {
    throw new ResultError(err('UnwrapError', result));
  }

  if (result.error !== error) {
    throw new ResultError(result);
  }

  return result as IExact<IPickResultFailure<T, U>>;
}


/**
 * Processes the given result by executing the matching case callback.
 *
 * This function examines the provided result, which may represent either a success or failure outcome.
 *
 * - If the result indicates success, the function calls the "success" callback with the result's data.
 * - If the result indicates failure:
 *   - It attempts to find and call an error-specific callback matching the result's error value.
 *   - If no error-specific callback is found, it optionally calls the "default" callback.
 *   - If neither is provided, it throws a ResultError with the result.
 *
 * @typeParam T - A type extending IUnknownResult representing either a success or failure.
 * @typeParam C - An object type with the following properties:
 *   - A mandatory "success" callback, which handles a successful result by accepting its data.
 *   - Optional error-specific callbacks keyed by possible error values when T is a failure.
 *   - An optional "default" callback for failure cases when no matching error-specific callback exists.
 *
 * @param result - The result object to be processed, which contains either a success flag and data,
 *                 or an error with an accompanying reason.
 * @param cases - An object mapping result scenarios to callbacks:
 *   - "success": A callback to be executed when the result is successful.
 *   - [error: string]: Optional callbacks for handling specific error cases.
 *   - "default": An optional callback to handle failure cases when no error-specific callback is provided.
 *
 * @returns The value returned by the invoked callback corresponding to the result's type.
 *
 * @throws ResultError if the result indicates failure and neither an error-specific nor a default callback is provided.
 */
export function mapResult<T extends IUnknownResult, C extends {
  [key in T extends IUnknownFailure ? T['error'] : never]?: T extends IUnknownFailure
  ? (error: T['error'], reason: T['reason']) => unknown
  : never
} & {
  success: T extends IUnknownSuccess ? (data: T['data']) => any : never
  default?: T extends IUnknownFailure ? (error: T['error'], reason: T['reason']) => unknown : never
}>(
  result: T,
  cases: C
): ReturnType<NonNullable<C[keyof C]>> {
  if (result.success) {
    return cases.success(result.data);
  }

  const errorCase = cases[result.error as keyof C];
  if (errorCase) {
    return errorCase(result.error, result.reason) as ReturnType<NonNullable<C[keyof C]>>;
  }

  if (cases.default) {
    return cases.default(result.error, result.reason) as ReturnType<NonNullable<C[keyof C]>>;
  }

  throw new ResultError(result);
}

/**
 * Custom error class for handling result errors.
 */
export class ResultError extends Error {
  public static messageMap = (result: IUnknownFailure) => {
    let message = `ResultError: ${result.error}`;

    if (result.reason) {
      message += ` - ${result.reason}`;
    }

    return message;
  }

  constructor(result: IUnknownFailure) {
    const message = ResultError.messageMap(result);

    super(message);

    this.name = "ResultError";
  }
}
