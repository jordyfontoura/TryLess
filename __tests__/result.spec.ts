import { ok, fail, IFuture, IResult } from "../src";
import {} from "../src/extensios";



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
    expect(result.isError()).toBeFalsy();
    expect(result.data).toBe(5);
    expect(result.error).toBeUndefined();
  });

  it("should divide by zero and return an error result", () => {
    const result = divide(10, 0);

    expect(result.isOk()).toBeFalsy();
    expect(result.isError()).toBeTruthy();
    expect(result.data).toBeUndefined();
    expect(result.error).toBe("Cannot divide by zero");
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
