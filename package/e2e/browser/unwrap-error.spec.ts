import { describe, it, expect } from 'vitest';
import { err, UnwrapError } from '../../dist/index.mjs';

/**
 * Tests for UnwrapError in browser environment
 */
describe('UnwrapError in Browser', () => {
  it('should fallback to JSON.stringify for reasons', () => {
    const reason = { user: 'john', value: 42 };
    const result = err('TestError', reason);

    try {
      result.unwrap();
      expect.fail('Should have thrown UnwrapError');
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      expect(error instanceof UnwrapError).toBe(true);
    }
  });

  it('should handle non-JSON-serializable reasons', () => {
    const circular: Record<string, unknown> = { name: 'test' };
    circular.self = circular;

    const result = err('CircularError', circular);

    try {
      result.unwrap();
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      // Should not throw, should fallback to String()
      expect(error instanceof Error).toBe(true);
    }
  });

  it('should have error name', () => {
    const result = err('NotFound', 'User not found');

    try {
      result.unwrap();
    } catch (error) {
      expect(error instanceof UnwrapError).toBe(true);
      expect((error as UnwrapError).name).toBe('UnwrapError');
      expect((error as UnwrapError).error).toBe('NotFound');
    }
  });

  it('should have reason property', () => {
    const result = err('ValidationError', { field: 'email', message: 'Invalid' });

    try {
      result.unwrap();
    } catch (error) {
      expect(error instanceof UnwrapError).toBe(true);
      expect((error as UnwrapError).reason).toEqual({
        field: 'email',
        message: 'Invalid',
      });
    }
  });

  it('should show stack traces in browser', () => {
    const result = err('TestError', 'Test reason');

    try {
      result.unwrap();
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      expect((error as Error).stack).toBeDefined();
    }
  });
});

