import { Future, success, fail, Result } from "../src";
import { assertType } from "./testing";

describe("Future", () => {
  async function past(n: number): Promise<number> {
    if (n === 0) {
      throw new Error("error");
    }

    return 20 / n;
  }

  async function future(n: number): Future<number, string> {
    if (n === 0) {
      return fail('error');
    }

    return success(20 / n);
  }

  it("should turn promise into future", async () => {
    const result = await past(2).asResult();

    assertType<Result<number, unknown>>(result);

    const [value, reason, isError] = result;

    expect(value).toBe(10);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();
  });

  it("should turn promise into future with default value", async () => {
    const value = await past(0).asResult().orDefault(0);

    assertType<number>(value);
    expect(value).toBe(0);
  });

  it("should turn promise into future with error handler", async () => {
    const value = await past(2).asResult().orElse(() => 0);

    assertType<number>(value);
    expect(value).toBe(10);
  });

  it("should turn promise into future with error handler", async () => {
    const value = await past(2).asResult().orThrow();

    assertType<number>(value);
    expect(value).toBe(10);

    try {
      await past(0).asResult().orThrow();
    } catch (err) {
      expect(err).toStrictEqual(new Error("error"));
    }
  });

  it("should turn future into future with default value", async () => {
    const value = await future(2).orDefault(0);

    assertType<number>(value);
    expect(value).toBe(10);
  });

  it("should turn future into future with error handler", async () => {
    const value = await future(2).orElse(() => 0);

    assertType<number>(value);
    expect(value).toBe(10);
  });

  it("should turn future into future with error handler", async () => {
    const value = await future(2).orThrow();

    assertType<number>(value);
    expect(value).toBe(10);

    try {
      await future(0).orThrow();
    } catch (err) {
      expect(err).toBe('error');
    }
  });

  it("should turn future into future with mapped value", async () => {
    const [value, error, isError] = await future(2).andThen((value) => value % 2 === 0 ? 'even' : 'odd');

    expect(isError).toBeFalsy();
    if (isError) {
      return;
    }

    assertType<'even' | 'odd'>(value);
    assertType<undefined>(error);
    expect(value).toBe('even');
  });
});