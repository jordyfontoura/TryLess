import { IFuture, ok, fail, IResult } from "../src";
import { assertType } from "./testing";

describe("Future", () => {
  async function past(n: number): Promise<number> {
    if (n === 0) {
      throw new Error("error");
    }

    return 20 / n;
  }

  async function future(n: number): IFuture<number, string> {
    if (n === 0) {
      return fail('error');
    }

    return ok(20 / n);
  }

  it("should assert types using asSafe", async () => {
    const result = await past(2).asSafe<Error>();

    assertType<number | undefined>(result.value);
    assertType<Error | undefined>(result.error);
  })

  it("should assert types using asSafe and !success", async () => {
    const result = await past(0).asSafe<Error>();

    if (!result.success) {
      assertType<Error>(result.error);
      assertType<undefined>(result.value);
      return;
    }

    assertType<undefined>(result.error);
    assertType<number>(result.value);
  })

  it("should assert types using asSafe and success", async () => {
    const result = await past(2).asSafe<Error>();

    if (result.success) {
      assertType<number>(result.value);
      assertType<undefined>(result.error);
      return;
    }

    assertType<undefined>(result.value);
    assertType<Error>(result.error);
  })

  it("should assert types using asSafe and isFail", async () => {
    const result = await past(0).asSafe<Error>();

    if (result.isError()) {
      assertType<Error>(result.error);
      assertType<undefined>(result.value);
      return;
    }

    assertType<undefined>(result.error);
    assertType<number>(result.value);
  })

  it("should assert types using asSafe and isOk", async () => {
    const result = await past(2).asSafe<Error>();

    if (result.isOk()) {
      assertType<number>(result.value);
      assertType<undefined>(result.error);
      return;
    }

    assertType<undefined>(result.value);
    assertType<Error>(result.error);
  })

  it("should turn promise into future", async () => {
    const result = await past(2).asSafe();

    assertType<IResult<number, unknown>>(result);
    expect(result.success).toBeTruthy();
    expect(result.value).toBe(10);
    expect(result.error).toBeUndefined();
  });

  it("should turn promise into future with default value", async () => {
    const value = await past(0).asSafe().orDefault(0);

    assertType<number>(value);
    expect(value).toBe(0);
  });

  it("should turn promise into future with error handler", async () => {
    const value = await past(2).asSafe().orElse(() => 0);

    assertType<number>(value);
    expect(value).toBe(10);
  });

  it("should turn promise into future with error handler", async () => {
    const promise = past(2).asSafe<Error>() 
    const value = await promise.orThrow((e)=>e.message);

    assertType<number>(value);
    expect(value).toBe(10);

    try {
      await past(0).asSafe().orThrow();
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

  it("", async () => {
    const [value, isOk] = await future(2).unwrap();

    assertType<number | string>(value);

    if (!isOk) {
      assertType<string>(value);
      return;
    }

    assertType<number>(value);
  })
});