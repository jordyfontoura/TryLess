import { success, error, IResult } from ".";

describe("Result", () => {
  it("should create a success result", () => {
    const [value, reason, isError] = success(1);

    expect(value).toBe(1);
    expect(reason).toBeUndefined();
    expect(isError).toBeFalsy();
  });

  it("should create an error result", () => {
    const [value, reason, isError] = error("error");

    expect(value).toBeUndefined();
    expect(reason).toBe("error");
    expect(isError).toBeTruthy();
  });

  it("should not return the default value", () => {
    const result = success(1);

    expect(result.orDefault(2)).toBe(1);
  });

  it("should return the default value", () => {
    const result = error("error");

    expect(result.orDefault(2)).toBe(2);
  });

  it("should return the value", () => {
    const result = success(1);

    expect(result.orElse(() => 2)).toBe(1);
  });

  it("should return the default value", () => {
    const result = error("error");

    expect(result.orElse(() => 2)).toBe(2);
  });

  it("should throw an error", () => {
    const result = error("error");

    expect(() => result.orThrow()).toThrow("error");
  });

  it("should throw an error with custom message", () => {
    const result = error("error");

    expect(() => result.orThrow("custom")).toThrow("custom");
  });

  it("should map the value", () => {
    const result = success(1);
    const mapped = result.andThen((value) => value + 1);

    expect(mapped[0]).toBe(2);
    expect(mapped[1]).toBeUndefined();
    expect(mapped[2]).toBeFalsy();
  });

  it("should map the error", () => {
    const result = error<string, number>("error");
    const mapped = result.andThen((value) => value + 1);

    expect(mapped[0]).toBeUndefined();
    expect(mapped[1]).toBe("error");
    expect(mapped[2]).toBeTruthy();
  });

  it("should create a random result", () => {
    const [value, reason, isError] =
      Math.random() > 0.5 ? success(1) : error("error");

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

    value = (await fn(0).asResult()).orDefault(0);

    expect(value).toBe(0);
    expect(reason).toBeDefined();
    expect(isError).toBeTruthy();
  });
});
