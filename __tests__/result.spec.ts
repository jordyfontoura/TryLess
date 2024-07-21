import { ok, fail, IFuture, IResult } from "../src";
import {} from "../src/extensios";
import { assertType } from "./testing";



describe("Result", () => {
  function divide(a: number, b: number): IResult<number, string> {
    if (b === 0) {
      return fail("Cannot divide by zero");
    }

    return ok(a / b);
  }

  it("should create a success result", () => {
    const [value, isOk] = ok(1).unwrap();

    expect(value).toBe(1);
    expect(isOk).toBeTruthy();
  });

  it("should create an error result", () => {
    const [value, isOk] = fail("error").unwrap();

    expect(value).toBe("error");
    expect(isOk).toBeFalsy();
  });

  it("should divide two numbers and return a success result", () => {
    const result = divide(10, 2);
      
    expect(result.isOk()).toBeTruthy();
    expect(result.isFail()).toBeFalsy();
    expect(result.value).toBe(5);
    expect(result.reason).toBeUndefined();
  });

  it("should divide by zero and return an error result", () => {
    const result = divide(10, 0);

    expect(result.isOk()).toBeFalsy();
    expect(result.isFail()).toBeTruthy();
    expect(result.value).toBeUndefined();
    expect(result.reason).toBe("Cannot divide by zero");
  });

  it("", () => {
    let [value, error, isError] = divide(10, 0).unwrapAll();

    expect(value).toBeUndefined();
    expect(error).toBe("Cannot divide by zero");
    expect(isError).toBeFalsy();

    [value, error, isError] = divide(10, 2).unwrapAll(false);

    expect(value).toBe(5);
    expect(error).toBeUndefined();
    expect(isError).toBeFalsy();
  })

  it("should return the value and error when dividing by zero", () => {
    const [value, error, isError] = divide(10, 0).unwrapAll(false);

    if (isError) {
      assertType<string>(error);
      assertType<true>(isError);
      assertType<undefined>(value);

      expect(error).toBe("Cannot divide by zero");
      expect(isError).toBeTruthy();
      expect(value).toBeUndefined();
    } else {
      assertType<false>(isError);
      assertType<number>(value);
      assertType<undefined>(error);

      expect(value).toBeUndefined();
      expect(isError).toBeFalsy();
      expect(error).toBe("Cannot divide by zero");
    }
  });

  it("should return the value and error when dividing by a non-zero number", () => {
    const [value, error, isError] = divide(10, 2).unwrapAll(false);

    if (isError) {
      assertType<string>(error);
      assertType<true>(isError);
      assertType<undefined>(value);

      expect(error).toBeUndefined();
      expect(isError).toBeFalsy();
      expect(value).toBe(5);
    } else {
      assertType<false>(isError);
      assertType<number>(value);
      assertType<undefined>(error);

      expect(value).toBe(5);
      expect(isError).toBeFalsy();
      expect(error).toBeUndefined();
    }
  });

  it("should not return the default value", () => {
    const result = ok(1);

    expect(result.orDefault(2)).toBe(1);
  });

  it("should return the default value", () => {
    const result = fail("error");

    expect(result.orDefault(2)).toBe(2);
  });

  it("should return the value", () => {
    const result = ok(1);

    expect(result.orElse(() => 2)).toBe(1);
  });

  it("should return the default value", () => {
    const result = fail("error");

    expect(result.orElse(() => 2)).toBe(2);
  });

  it("should throw an error", () => {
    const result = fail("error");

    expect(() => result.orThrow()).toThrow("error");
  });

  it("should throw an error with custom message", () => {
    const result = fail("error");

    expect(() => result.orThrow("custom")).toThrow("custom");
  });

  it("should map the value", () => {
    const result = ok<number, number>(1);
    const [value, isOk] = result.andThen((value: number) => (value  % 2 === 0 ? 'even' : 'odd') as 'even' | 'odd').unwrap();

    expect(isOk).toBeTruthy();

    if (!isOk) {
      assertType<number>(value);
      assertType<false>(isOk);

      return;
    }

    assertType<'even' | 'odd'>(value);
    assertType<true>(isOk);

    expect(value).toBe('odd');
    expect(isOk).toBeTruthy();
  });

  it("should map the error", () => {
    const result = fail<string, number>("error");
    const [value, isOk] = result.andThen((value) => value + 1).unwrap();

    expect(isOk).toBeFalsy();
    expect(value).toBe("error");
  });

  it("should turn promise into result", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    let [value, isOk] = await fn(2).asResult().unwrap();

    expect(isOk).toBeTruthy();
    expect(value).toBe(8.5);

    [value, isOk] = await fn(0).asResult().unwrap();

    expect(value).toBeDefined();
    expect(isOk).toBeFalsy();
  });

  it("should turn promise into result with default value", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    let value = await fn(2).asResult().orDefault(0);

    expect(value).toBe(8.5);

    value = await fn(0).asResult().orDefault(0);

    expect(value).toBe(0);
  });

  it("should turn promise into result with error handler", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    let value = await fn(2)
      .asResult()
      .orElse(() => 0);

    expect(value).toBe(8.5);

    value = await fn(0)
      .asResult()
      .orElse(() => 0);

    expect(value).toBe(0);
  });

  it("should turn promise into result with error handler", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    const value = await fn(2).asResult().orThrow();

    expect(value).toBe(8.5);

    try {
      await fn(0).asResult().orThrow();
    } catch (err) {
      expect(err).toStrictEqual(new Error("error"));
    }
  });

  it("should turn promise into result with value mapping", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    let [value, isOk] = await fn(2)
      .asResult()
      .andThen((v) => v + 1)
      .unwrap();

      expect(value).toBe(9.5);
      expect(isOk).toBeTruthy();

    [value, isOk] = await fn(0)
      .asResult()
      .andThen((v) => v + 1)
      .unwrap();

    expect(value).toBeDefined();
    expect(isOk).toBeFalsy();
  });

  it("should return 8.5 for non-zero inputs and 0 for zero input", async () => {
    async function fn(n: number): IFuture<number, string> {
      if (n === 0) {
        return fail("Cannot divide by zero");
      }

      return ok(17 / n);
    }

    let value = await fn(2).orDefault(0);

    expect(value).toBe(8.5);

    value = await fn(0).orDefault(0);

    expect(value).toBe(0);
  });
});
