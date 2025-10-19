import { ok, err } from '../../src';

/**
 * Helper function to assert types at compile time
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T>(_value: T) { }

/**
 * Tests for type inference and type safety
 */
describe('type inference', () => {
  describe('ok type inference', () => {
    it('should correctly infer number type', () => {
      const result = ok(42);

      if (result.success) {
        const data: number = result.data;
        expect(data).toBe(42);
      }
    });

    it('should correctly infer string type', () => {
      const result = ok('hello');

      if (result.success) {
        const data: string = result.data;
        expect(data).toBe('hello');
      }
    });

    it('should correctly infer object type', () => {
      const result = ok({ id: 1, name: 'Test' });

      if (result.success) {
        const data: { id: number; name: string } = result.data;
        expect(data.id).toBe(1);
        expect(data.name).toBe('Test');
      }
    });

    it('should correctly infer array type', () => {
      const result = ok([1, 2, 3]);

      if (result.success) {
        const data: number[] = result.data;
        expect(data).toEqual([1, 2, 3]);
      }
    });

    it('should infer undefined for empty ok()', () => {
      const result = ok();

      if (result.success) {
        const data: undefined = result.data;
        expect(data).toBeUndefined();
      }
    });
  });

  describe('err type inference', () => {
    it('should correctly infer error string literal type', () => {
      const result = err('NotFound');

      if (!result.success) {
        const error: 'NotFound' = result.error;
        expect(error).toBe('NotFound');
      }
    });

    it('should correctly infer reason type', () => {
      const result = err('ValidationError', 'Invalid email');

      if (!result.success) {
        const reason: string = result.reason;
        expect(reason).toBe('Invalid email');
      }
    });

    it('should correctly infer object reason type', () => {
      const reason = { code: 404, message: 'Not found' };
      const result = err('NotFound', reason);

      if (!result.success) {
        const r: { code: number; message: string } = result.reason;
        expect(r).toEqual(reason);
      }
    });
  });

  describe('discriminated union', () => {
    it('should narrow type based on success property', () => {
      const result = ok(42);

      if (result.success) {
        // TypeScript should know this is Ok<number>
        expect(result.data).toBe(42);
      } else {
        // This branch should never execute
        expect(true).toBe(false);
      }
    });

    it('should narrow type based on success property for errors', () => {
      const result = err('NotFound', 'User not found');

      if (!result.success) {
        // TypeScript should know this is Err
        expect(result.error).toBe('NotFound');
        expect(result.reason).toBe('User not found');
      } else {
        // This branch should never execute
        expect(true).toBe(false);
      }
    });
  });

  describe('complex type scenarios', () => {
    interface User {
      id: number;
      name: string;
      email: string;
    }

    function findUser(id: number): ReturnType<typeof ok<User>> | ReturnType<typeof err<'NotFound'>> {
      if (id === 1) {
        return ok({ id: 1, name: 'John', email: 'john@example.com' });
      }

      return err('NotFound');
    }

    it('should work with union return types', () => {
      const result = findUser(1);

      if (result.success) {
        expect(result.data.id).toBe(1);
        expect(result.data.name).toBe('John');
      }
    });

    it('should handle error case in union types', () => {
      const result = findUser(999);

      if (!result.success) {
        expect(result.error).toBe('NotFound');
      }
    });
  });

  describe('generic type preservation', () => {
    function processData<T>(data: T) {
      return ok(data);
    }

    it('should preserve generic types through function calls', () => {
      const result = processData({ value: 42 });

      if (result.success) {
        expect(result.data.value).toBe(42);
      }
    });

    it('should preserve array generic types', () => {
      const result = processData([1, 2, 3]);

      if (result.success) {
        expect(result.data).toEqual([1, 2, 3]);
      }
    });
  });
});

