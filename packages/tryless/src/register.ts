/* eslint-disable @typescript-eslint/no-explicit-any */
import { ok, errReject } from './result/functions';
import { UnknownError } from './result/errors';
import type { ISuccess, IExact, IEmptyUnknownFailure } from './result/types';


/**
 * Extends the global Promise interface to include the asResult() method
 */
declare global {
  interface Promise<T> {
    /**
     * Converts a Promise to a Result.
     * On success, returns { success: true, data: T }
     * On error, returns { success: false, error: 'unknown', reason: unknown }
     * 
     * @example
     * ```ts
     * import 'tryless/register';
     * 
     * // Using with Result
     * const result = await fetch(url).asResult();
     * if (result.success) {
     *   console.log(result.data); // Response
     * } else {
     *   console.error(result.error, result.reason);
     * }
     * ```
     */
    asResult(): Promise<IExact<ISuccess<T>> | IExact<IEmptyUnknownFailure>>;
  }
}

/**
 * Implements the asResult() method on the Promise prototype
 */
if (!Object.prototype.hasOwnProperty.call(Promise.prototype, 'asResult')) {
  Promise.prototype.asResult = function <T>(this: Promise<T>): Promise<IExact<ISuccess<T>> | IExact<IEmptyUnknownFailure>> {
    const resultPromise = this.then(
      (data) => ok(data) as IExact<ISuccess<T>>,
      errReject(UnknownError) as any
    )

    return resultPromise;
  };
}

export { };

