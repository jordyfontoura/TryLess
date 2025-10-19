import { ok, err } from '../../src';

/**
 * Tests for the ok function and Ok class
 */
describe('ok function', () => {
  describe('creation', () => {
    it('should create a success result with data', () => {
      const data = { name: 'Test' };
      const result = ok(data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should create an empty success result', () => {
      const result = ok();

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should preserve data type', () => {
      const result = ok(42);

      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should handle null values', () => {
      const result = ok(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle complex objects', () => {
      const complexData = {
        id: 1,
        nested: { value: 'test' },
        array: [1, 2, 3],
      };
      const result = ok(complexData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(complexData);
    });
  });

  describe('unwrap methods', () => {
    it('should unwrap successfully', () => {
      const result = ok(42);
      const data = result.unwrap();

      expect(data).toBe(42);
    });

    it('should unwrapOr and return data', () => {
      const result = ok(42);
      const data = result.unwrapOr(0);

      expect(data).toBe(42);
    });

    it('should unwrapOrElse and return data without calling function', () => {
      const result = ok(42);
      const fallback = jest.fn(() => 0);
      const data = result.unwrapOrElse(fallback);

      expect(data).toBe(42);
      expect(fallback).not.toHaveBeenCalled();
    });

    it('should throw when unwrapping as error', () => {
      const result = ok(42);

      expect(() => result.unwrapErr()).toThrow();
    });

    it('should unwrapErrOr and return default value', () => {
      const result = ok(42);
      const defaultValue = 'default';
      const value = result.unwrapErrOr(defaultValue);

      expect(value).toBe(defaultValue);
    });

    it('should unwrapErrOrElse and call function', () => {
      const result = ok(42);
      const fallback = jest.fn(() => 'fallback');
      const value = result.unwrapErrOrElse(fallback);

      expect(value).toBe('fallback');
      expect(fallback).toHaveBeenCalledWith(result);
    });
  });

  describe('expect method', () => {
    it('should throw when expecting an error on success result', () => {
      const result = ok(42);

      expect(() => result.expect('NotFound')).toThrow();
    });
  });

  describe('combinators', () => {
    it('should return the next result with and()', () => {
      const result1 = ok(42);
      const result2 = ok('next');
      const combined = result1.and(result2);

      expect(combined).toBe(result2);
    });

    it('should apply function with andThen()', () => {
      const result = ok(42);
      const doubled = result.andThen((data) => ok(data * 2));

      expect(doubled.success).toBe(true);
      expect(doubled.data).toBe(84);
    });

    it('should return itself with or()', () => {
      const result1 = ok(42);
      const result2 = ok('fallback');
      const combined = result1.or(result2);

      expect(combined).toBe(result1);
    });

    it('should return itself with orElse()', () => {
      const result = ok(42);
      const fallback = jest.fn(() => err('fallback'));
      const combined = result.orElse(fallback);

      expect(combined).toBe(result);
      expect(fallback).not.toHaveBeenCalled();
    });
  });

  describe('map method', () => {
    it('should apply transformation function', () => {
      const result = ok(42);
      const transformed = result.map((r) => r.data * 2);

      expect(transformed).toBe(84);
    });

    it('should allow complex transformations', () => {
      const result = ok({ value: 10 });
      const transformed = result.map((r) => ({
        doubled: r.data.value * 2,
        success: r.success,
      }));

      expect(transformed).toEqual({
        doubled: 20,
        success: true,
      });
    });
  });

  describe('type checking methods', () => {
    it('should return true for isOk()', () => {
      const result = ok(42);

      expect(result.isOk()).toBe(true);
    });

    it('should return false for isErr()', () => {
      const result = ok(42);

      expect(result.isErr()).toBe(false);
    });
  });

  describe('toString method', () => {
    it('should return string representation', () => {
      const result = ok(42);
      const str = result.toString();

      expect(str).toContain('Success');
      expect(str).toContain('42');
    });

    it('should handle complex objects in toString', () => {
      const result = ok({ name: 'Test' });
      const str = result.toString();

      expect(str).toContain('Success');
    });
  });
});

