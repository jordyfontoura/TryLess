import { IResultPromise } from "./result";
import { promiseAsResult } from "./utilities";

declare global {
  interface Promise<T> {
    /**
     * Converts a promise into a result
     * @returns A promise that resolves to a result
     * @example
     * const [value, reason, isError] = await fetch("https://example.com").asResult();
     *
     * if (isError) {
     *  console.error(reason);
     *  return;
     * }
     *
     * console.log(value);
     */
    asResult<U = T, E = Error>(): IResultPromise<U, E>;

  }
}

Promise.prototype.asResult = function asResult<T = unknown, E = Error>(): IResultPromise<T, E> {
  return promiseAsResult(this);
}


export {};


