import { describe, it, expect } from 'vitest';
import { ok, err } from '../../dist/index.esm.js';

/**
 * Tests to ensure API consistency across Node.js and Browser environments
 */
describe('ok() API consistency', () => {
  it('should create success result with data', () => {
    const result = ok(42);

    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  it('should work with objects', () => {
    const data = { id: 1, name: 'Test' };
    const result = ok(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('should work with arrays', () => {
    const data = [1, 2, 3, 4, 5];
    const result = ok(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('should work with undefined', () => {
    const result = ok();

    expect(result.success).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it('should work with null', () => {
    const result = ok(null);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});

describe('err() API consistency', () => {
  it('should create error result', () => {
    const result = err('TestError', 'Test reason');

    expect(result.success).toBe(false);
    expect(result.error).toBe('TestError');
    expect(result.reason).toBe('Test reason');
  });

  it('should work without reason', () => {
    const result = err('TestError');

    expect(result.success).toBe(false);
    expect(result.error).toBe('TestError');
    expect(result.reason).toBeUndefined();
  });

  it('should work with object reasons', () => {
    const reason = { field: 'email', message: 'Invalid format' };
    const result = err('ValidationError', reason);

    expect(result.success).toBe(false);
    expect(result.error).toBe('ValidationError');
    expect(result.reason).toEqual(reason);
  });
});

describe('Result methods consistency', () => {
  describe('unwrap()', () => {
    it('should return data for Ok', () => {
      const result = ok(42);
      expect(result.unwrap()).toBe(42);
    });

    it('should throw for Err', () => {
      const result = err('TestError', 'Test reason');
      expect(() => result.unwrap()).toThrow();
    });
  });

  describe('unwrapOr()', () => {
    it('should return data for Ok', () => {
      const result = ok(42);
      expect(result.unwrapOr(0)).toBe(42);
    });

    it('should return fallback for Err', () => {
      const result = err('TestError', 'Test reason');
      expect(result.unwrapOr(0)).toBe(0);
    });
  });

  describe('isOk() and isErr()', () => {
    it('should identify Ok results', () => {
      const result = ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
    });

    it('should identify Err results', () => {
      const result = err('TestError', 'Test reason');
      expect(result.isOk()).toBe(false);
      expect(result.isErr()).toBe(true);
    });
  });

  describe('map()', () => {
    it('should transform Ok values', () => {
      const result = ok(42);
      const mapped = result.andThen((res) => ok(res * 2));

      expect(mapped.success).toBe(true);
      if (mapped.success) {
        expect(mapped.data).toBe(84);
      }
    });

    it('should pass through Err values', () => {
      const result = err('TestError', 'Test reason');
      const mapped = result.andThen((data) => ok((data as unknown) * 2));

      expect(mapped.success).toBe(false);
      if (!mapped.success) {
        expect(mapped.error).toBe('TestError');
      }
    });
  });
});

describe('Type narrowing consistency', () => {
  it('should narrow Ok type with success property', () => {
    const result = ok({ id: 1, name: 'Test' });

    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test');
    } else {
      expect.fail('Should be Ok');
    }
  });

  it('should narrow Err type with success property', () => {
    const result = err('TestError', 'Test reason');

    if (!result.success) {
      expect(result.error).toBe('TestError');
      expect(result.reason).toBe('Test reason');
    } else {
      expect.fail('Should be Err');
    }
  });
});

