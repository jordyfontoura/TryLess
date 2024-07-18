import { Future, resultifyAsyncFunction, Result, resultifyFunction } from "../src";
import { assertType } from "./testing";

describe("Utilities", () => {
  async function asyncPast(n: number): Promise<number> {
    if (n === 0) {
      throw new Error("error");
    }

    return 20 / n;
  }

  function past(n: number): number {
    if (n === 0) {
      throw new Error("error");
    }

    return 20 / n;
  }

  it("should correctly handle asyncFutureFn", async () => {
    const asyncFutureFn = resultifyAsyncFunction<number, string>(asyncPast);

    assertType<(n: number) => Future<number, string>>(asyncFutureFn);

    const [value, error, isError] = await asyncFutureFn(2);

    expect(isError).toBeFalsy();

    if (isError) {
      assertType<unknown>(error);
      assertType<undefined>(value);

      return;
    }

    assertType<number>(value);
    assertType<undefined>(error);

    expect(value).toBe(10);
    expect(error).toBeUndefined();
  });

  it("should correctly handle futureFn", () => {
    const futureFn = resultifyFunction<number, string>(past);

    assertType<(n: number) => Result<number, string>>(futureFn);

    const [value, error, isError] = futureFn(2);

    expect(isError).toBeFalsy();

    if (isError) {
      assertType<unknown>(error);
      assertType<undefined>(value);

      return;
    }

    assertType<number>(value);
    assertType<undefined>(error);

    expect(value).toBe(10);
    expect(error).toBeUndefined();
  })
});