/* eslint-disable @typescript-eslint/no-explicit-any */
export type ISuccess<T> = { success: true; data: T };
export type IFailure<E extends string> = { success: false; error: E };
export type IFailureWithReason<E extends string, R> = { success: false; error: E; reason: R };
export type IResult<T, E extends IFailure<any>[]> = ISuccess<T> | E[number];
export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data };
}

export function err<E extends string>(error: E): { success: false; error: E };
export function err<E extends string, C>(
  error: E,
  reason: C
): { success: false; error: E; reason: C };
export function err<E extends string, C = never>(
  error: E,
  reason?: C
): { success: false; error: E; reason?: C } {
  return { success: false, error, reason };
}

export function okFulfilled<T, R = T>(
  map: (data: T) => R
): (data: T) => { success: true; data: R } {
  return (data) => ok(map(data));
}

export function errReject<E extends string>(
  error: E
): (reason: unknown) => { success: false; error: E; reason: unknown } {
  return (reason) => err(error, reason);
}

export function resultfy<F extends Promise<any>>(
  fn: F
): Promise<
  | { success: true; data: Awaited<F> }
  | { success: false; error: "unknown"; reason: unknown }
>;
export function resultfy<F extends Promise<any>, E extends { success: false }>(
  fn: F,
  onReject: (reason: unknown) => E
): Promise<{ success: true; data: Awaited<F> } | E>;

export function resultfy<F extends (...args: any) => any>(
  fn: F
): ReturnType<F> extends never
  ? (...args: Parameters<F>) => {
      success: false;
      error: "unknown";
      reason: unknown;
    }
  : ReturnType<F> extends Promise<never>
  ? (
      ...args: Parameters<F>
    ) => Promise<{ success: false; error: "unknown"; reason: unknown }>
  : ReturnType<F> extends Promise<infer U>
  ? (
      ...args: Parameters<F>
    ) => Promise<
      | { success: true; data: U }
      | { success: false; error: "unknown"; reason: unknown }
    >
  : (
      ...args: Parameters<F>
    ) =>
      | { success: true; data: ReturnType<F> }
      | { success: false; error: "unknown"; reason: unknown };
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
  ? (...args: Parameters<F>) => Promise<{ success: true; data: U } | E>
  : (...args: Parameters<F>) => { success: true; data: ReturnType<F> } | E;

export function resultfy<F, E extends { success: false }>(
  fn: F,
  onReject?: (reason: unknown) => E
): any {
  if (fn instanceof Promise) {
    return fn.then(ok, onReject || (errReject("unknown") as any));
  }

  if (typeof fn !== "function") {
    throw new Error("fn must be a function or a promise");
  }

  return ((...args: any) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.then(ok, onReject || (errReject("unknown") as any));
      }
      return ok(result);
    } catch (reason) {
      return onReject ? onReject(reason) : err("unknown", reason);
    }
  }) as any;
}

