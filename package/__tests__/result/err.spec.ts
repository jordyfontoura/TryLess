import { err } from '../../src';
import { describe, it, expect, vi } from 'vitest';

/**
 * Tests for the err function and Err class
 */
describe('err function', () => {
  describe('creation', () => {
    it('should create an error result with just error message', () => {
      const result = err('NotFound');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NotFound');
      expect(result.reason).toBeUndefined();
    });

    it('should create an error result with error and reason', () => {
      const result = err('ValidationError', 'Invalid email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ValidationError');
      expect(result.reason).toBe('Invalid email');
    });

    it('should create an error with unknown type when no params', () => {
      const result = err();

      expect(result.success).toBe(false);
      expect(result.error).toBe('unknown');
    });

    it('should handle object as reason', () => {
      const reason = { code: 500, message: 'Server error' };
      const result = err('ServerError', reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ServerError');
      expect(result.reason).toEqual(reason);
    });

    it('should capture stack trace', () => {
      const result = err('TestError', 'test reason');

      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });
  });

  describe('unwrap methods', () => {
    it('should throw when unwrapping', () => {
      const result = err('NotFound');

      expect(() => result.unwrap()).toThrow();
    });

    it('should unwrapOr and return default value', () => {
      const result = err('NotFound');
      const data = result.unwrapOr(42);

      expect(data).toBe(42);
    });

    it('should unwrapOrElse and compute default value', () => {
      const result = err('NotFound', 'User not found');
      const fallback = vi.fn((r) => `Error: ${r.error}`);
      const data = result.unwrapOrElse(fallback);

      expect(data).toBe('Error: NotFound');
      expect(fallback).toHaveBeenCalledWith(result);
    });

    it('should unwrapErr successfully', () => {
      const result = err('NotFound');
      const errorResult = result.unwrapErr();

      expect(errorResult).toBe(result);
    });

    it('should unwrapErrOr and return itself', () => {
      const result = err('NotFound');
      const value = result.unwrapErrOr('default');

      expect(value).toBe(result);
    });

    it('should unwrapErrOrElse and return itself', () => {
      const result = err('NotFound');
      const fallback = vi.fn(() => 'fallback');
      const value = result.unwrapErrOrElse(fallback);

      expect(value).toBe(result);
      expect(fallback).not.toHaveBeenCalled();
    });
  });

  describe('expect method', () => {
    it('should return itself when error matches', () => {
      const result = err('NotFound');
      const expected = result.expect('NotFound');

      expect(expected).toBe(result);
    });

    it('should throw when error does not match', () => {
      const result = err('NotFound');

      expect(() => result.expect('ValidationError')).toThrow();
    });

    it('should throw with custom error message', () => {
      const result = err('NotFound');

      expect(() => result.expect('ValidationError', 'custom')).toThrow();
    });
  });

  describe('combinators', () => {
    it('should return itself with and()', () => {
      const result1 = err('Error1');
      const result2 = err('Error2');
      const combined = result1.and(result2);

      expect(combined).toBe(result1);
    });

    it('should return itself with andThen()', () => {
      const result = err('Error1');
      const fn = vi.fn(() => err('Error2'));
      const combined = result.andThen(fn);

      expect(combined).toBe(result);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should return alternative with or()', () => {
      const result1 = err('Error1');
      const result2 = err('Error2');
      const combined = result1.or(result2);

      expect(combined).toBe(result2);
    });

    it('should apply function with orElse()', () => {
      const result = err('Error1');
      const fallback = vi.fn(() => err('Error2'));
      const combined = result.orElse(fallback);

      expect(combined.success).toBe(false);
      expect(combined.error).toBe('Error2');
      expect(fallback).toHaveBeenCalledWith(result);
    });
  });

  describe('map method', () => {
    it('should apply transformation function', () => {
      const result = err('NotFound', 'User not found');
      const transformed = result.map((r) => ({
        error: r.error,
        message: r.reason,
      }));

      expect(transformed).toEqual({
        error: 'NotFound',
        message: 'User not found',
      });
    });
  });

  describe('type checking methods', () => {
    it('should return false for isOk()', () => {
      const result = err('NotFound');

      expect(result.isOk()).toBe(false);
    });

    it('should return true for isErr()', () => {
      const result = err('NotFound');

      expect(result.isErr()).toBe(true);
    });
  });

  describe('toString method', () => {
    it('should return string representation', () => {
      const result = err('NotFound', 'User not found');
      const str = result.toString();

      expect(str).toContain('NotFound');
      expect(str).toContain('User not found');
    });

    it('should handle undefined reason', () => {
      const result = err('NotFound');
      const str = result.toString();

      expect(str).toContain('NotFound');
    });
  });
});

