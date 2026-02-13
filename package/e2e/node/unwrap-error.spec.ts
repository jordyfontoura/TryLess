import { describe, it, expect } from 'vitest';
import { err, UnwrapError } from '../../dist/index.mjs';
import { inspect } from 'util';

/**
 * Tests for UnwrapError in Node.js environment
 */
describe('UnwrapError in Node.js', () => {
  it('should use util.inspect for complex reasons', () => {
    const complexReason = {
      user: 'john',
      nested: { value: 42, deep: { level: 3 } },
    };
    const result = err('TestError', complexReason);

    try {
      result.unwrap();
      expect.fail('Should have thrown UnwrapError');
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      const inspected = inspect(error);

      expect(inspected).toContain('john');
      expect(inspected).toContain('nested');
      expect(inspected).toContain('value');
    }
  });

  it('should format error with custom inspect', () => {
    const result = err('NotFound', { id: 123, message: 'User not found' });

    try {
      result.unwrap();
    } catch (error) {
      if (error instanceof UnwrapError) {
        const customInspect = (error as Record<string, unknown>)[
          Symbol.for('nodejs.util.inspect.custom')
        ];
        expect(typeof customInspect).toBe('function');
      }
    }
  });

  it('should handle circular references gracefully', () => {
    const circular: Record<string, unknown> = { name: 'test' };
    circular.self = circular;

    const result = err('CircularError', circular);

    try {
      result.unwrap();
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      // Should not throw when inspecting circular reference
      const inspected = inspect(error);
      expect(typeof inspected).toBe('string');
    }
  });

  it('should show stack traces in Node.js', () => {
    const result = err('TestError', 'Test reason');

    try {
      result.unwrap();
    } catch (error) {
      expect(error).toBeInstanceOf(UnwrapError);
      expect((error as Error).stack).toBeDefined();
      expect((error as Error).stack).toContain('unwrap-error.spec');
    }
  });
});

