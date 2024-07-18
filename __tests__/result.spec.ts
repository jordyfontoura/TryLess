import { success, fail } from "../src";
import { Future } from "../src/future";
import {} from "../src/extensios";

describe("Result", () => {
  it("should create a success result", () => {
    const [value, reason, isError] = success(1);

    expect(value).toBe(1);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();
  });

  it("should create an error result", () => {
    const [value, reason, isError] = fail("error");

    expect(value).toBeUndefined();
    expect(reason).toBe("error");
    expect(isError).toBeTruthy();
  });

  it("should not return the default value", () => {
    const result = success(1);

    expect(result.orDefault(2)).toBe(1);
  });

  it("should return the default value", () => {
    const result = fail("error");

    expect(result.orDefault(2)).toBe(2);
  });

  it("should return the value", () => {
    const result = success(1);

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
    const result = success(1);
    const [value, reason, isError] = result.andThen((value) => value + 1);

    expect(value).toBe(2);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();
  });

  it("should map the error", () => {
    const result = fail<string, number>("error");
    const [value, reason, isError] = result.andThen((value) => value + 1);

    expect(value).toBeUndefined();
    expect(reason).toBe("error");
    expect(isError).toBeTruthy();
  });

  it("should create a random result", () => {
    const [value, reason, isError] =
      Math.random() > 0.5 ? success(1) : fail("error");

    if (isError) {
      expect(value).toBeUndefined();
      expect(reason).toBeDefined();
      expect(isError).toBeTruthy();
      return;
    }

    expect(value).toBe(1);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();
  });

  it("should turn promise into result", async () => {
    async function fn(n: number): Promise<number> {
      if (n === 0) {
        throw new Error("error");
      }

      return 17 / n;
    }

    let [value, reason, isError] = await fn(2).asResult();

    expect(value).toBe(8.5);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();

    [value, reason, isError] = await fn(0).asResult();

    expect(value).toBeUndefined();
    expect(reason).toBeDefined();
    expect(isError).toBeTruthy();
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

    let [value, reason, isError] = await fn(2)
      .asResult()
      .andThen((v) => v + 1);

    expect(value).toBe(9.5);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();

    [value, reason, isError] = await fn(0)
      .asResult()
      .andThen((v) => v + 1);

    expect(value).toBeUndefined();
    expect(reason).toBeDefined();
    expect(isError).toBeTruthy();
  });

  it("should return 8.5 for non-zero inputs and 0 for zero input", async () => {
    async function fn(n: number): Future<number, string> {
      if (n === 0) {
        return fail("Cannot divide by zero");
      }

      return success(17 / n);
    }

    let value = await fn(2).orDefault(0);

    expect(value).toBe(8.5);

    value = await fn(0).orDefault(0);

    expect(value).toBe(0);
  });
});
