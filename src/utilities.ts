import { Future } from "./future";
import { fail, Result, success } from "./result";

/**
 * Converts an async function into a result async function
 * @param fn Async function to be converted
 * @returns A function that returns a promise that resolves to a result
 * @example
 * const fn = resultifyAsyncFunction(async (x) => x + 1);
 * const [value, reason, isError] = await fn(1);
 */
export function resultifyAsyncFunction<T, E=unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any) => Promise<T>,
): (...args: Parameters<typeof fn>) => Future<T, E> {
  return (...args) => fn(...args).then(success, fail) as Future<T, E>;
}

/**
 * Converts a function into a result function
 * @param fn Function to be converted
 * @returns A function that returns a result
 * @example
 * const fn = resultifyFunction((x) => x + 1);
 * const [value, reason, isError] = fn(1);
 */
export function resultifyFunction<T, E = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any) => T,
): (...args: Parameters<typeof fn>) => Result<T, E> {
  return (...args) => {
    try {
      return success(fn(...args));
    } catch (err) {
      return fail(err) as Result<T, E>;
    }
  };
}

/**
 * Converts a promise into a result promise
 * @param promise Promise to be converted
 * @returns A promise that resolves to a result
 * @example
 * const [value, reason, isError] = await resultifyPromise(fetch("https://example.com"));
 */
export function resultifyPromise<T, E = unknown>(
  promise: Promise<T>,
): Future<T, E> {
  return promise.then(success, fail) as Future<T, E>;
}

