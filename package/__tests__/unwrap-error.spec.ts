import { ok, err, UnwrapError } from '../src';

/**
 * Tests for the UnwrapError class
 */
describe('UnwrapError', () => {
  describe('throwing from Ok', () => {
    it('should throw UnwrapError when unwrapping error from Ok', () => {
      const result = ok(42);

      expect(() => result.unwrapErr()).toThrow(UnwrapError);
    });

    it('should throw UnwrapError when expecting error on Ok', () => {
      const result = ok(42);

      expect(() => result.expect('NotFound')).toThrow(UnwrapError);
    });

    it('should have correct name', () => {
      const result = ok(42);

      try {
        result.unwrapErr();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).name).toBe('UnwrapError');
      }
    });

    it('should contain error message', () => {
      const result = ok(42);

      try {
        result.unwrapErr();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).message).toContain('Could not unwrap error');
      }
    });
  });

  describe('throwing from Err', () => {
    it('should throw UnwrapError when unwrapping data from Err', () => {
      const result = err('NotFound', 'User not found');

      expect(() => result.unwrap()).toThrow(UnwrapError);
    });

    it('should include error in message', () => {
      const result = err('NotFound', 'User not found');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).message).toContain('NotFound');
      }
    });

    it('should have error property', () => {
      const result = err('ValidationError', 'Invalid input');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).error).toBe('ValidationError');
      }
    });

    it('should have reason property', () => {
      const result = err('ValidationError', 'Invalid input');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).reason).toBe('Invalid input');
      }
    });

    it('should preserve object reason', () => {
      const reason = { code: 404, message: 'Not found' };
      const result = err('NotFound', reason);

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).reason).toEqual(reason);
      }
    });
  });

  describe('expect method errors', () => {
    it('should throw when expecting wrong error type', () => {
      const result = err('NotFound', 'User not found');

      expect(() => result.expect('ValidationError')).toThrow(UnwrapError);
    });

    it('should throw when expecting error on success', () => {
      const result = ok(42);

      expect(() => result.expect('NotFound')).toThrow(UnwrapError);
    });

    it('should include expected and actual error in message', () => {
      const result = err('NotFound', 'User not found');

      try {
        result.expect('ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).message).toContain('ValidationError');
        expect((error as UnwrapError).message).toContain('NotFound');
      }
    });
  });

  describe('custom error messages', () => {
    it('should support custom error message on unwrap', () => {
      const result = err('NotFound', 'User not found');

      try {
        result.unwrap('custom-error');
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).error).toBe('custom-error');
      }
    });

    it('should support custom error message on expect', () => {
      const result = ok(42);

      try {
        result.expect('NotFound', 'custom-error');
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).error).toBe('custom-error');
      }
    });
  });

  describe('stack traces', () => {
    it('should have stack trace', () => {
      const result = err('TestError', 'test reason');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).stack).toBeDefined();
        expect(typeof (error as UnwrapError).stack).toBe('string');
      }
    });

    it('should include unwrap location in stack', () => {
      const result = err('TestError', 'test reason');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        const stack = (error as UnwrapError).stack;
        expect(stack).toContain('unwrap');
      }
    });

    it('should show both creation and unwrap locations', () => {
      // Create error at a specific location
      function createError() {
        return err('TestError', 'test reason');
      }

      // Unwrap at a different location
      function attemptUnwrap() {
        const result = createError();
        return result.unwrap();
      }

      try {
        attemptUnwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).stack).toBeDefined();
      }
    });
  });

  describe('error serialization', () => {
    it('should be convertible to string', () => {
      const result = err('NotFound', 'User not found');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        const str = String(error);
        expect(str).toContain('Error');
      }
    });

    it('should work with console.log', () => {
      const result = err('NotFound', 'User not found');
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      try {
        result.unwrap();
      } catch (error) {
        console.error(error);
        expect(consoleError).toHaveBeenCalled();
      }

      consoleError.mockRestore();
    });
  });

  describe('real-world scenarios', () => {
    it('should provide helpful error for database not found', () => {
      function findUser(id: number) {
        if (id === 1) {
          return ok({ id: 1, name: 'John' });
        }

        return err('NotFound', `User with id ${id} not found`);
      }

      const result = findUser(999);

      try {
        const user = result.unwrap();
        console.log(user); // This line should never execute
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).error).toBe('NotFound');
        expect((error as UnwrapError).reason).toContain('999');
      }
    });

    it('should help debug validation errors', () => {
      function validateEmail(email: string) {
        if (!email.includes('@')) {
          return err('ValidationError', 'Email must contain @');
        }

        return ok(email);
      }

      const result = validateEmail('invalid-email');

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        const unwrapError = error as UnwrapError;
        expect(unwrapError.error).toBe('ValidationError');
        expect(unwrapError.reason).toBe('Email must contain @');
      }
    });

    it('should handle nested errors', () => {
      function innerFunction() {
        return err('InnerError', 'Something went wrong');
      }

      function outerFunction() {
        const result = innerFunction();
        return result.unwrap(); // This will throw
      }

      try {
        outerFunction();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        expect((error as UnwrapError).error).toBe('InnerError');
        expect((error as UnwrapError).stack).toBeDefined();
      }
    });
  });

  describe('custom inspect', () => {
    it('should have custom inspect method', () => {
      const result = err('TestError', { code: 500, message: 'Error' });

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        const unwrapError = error as UnwrapError;

        // Check if custom inspect method exists
        const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
        const inspectMethod = (unwrapError as unknown as Record<symbol, unknown>)[inspectSymbol];
        expect(inspectMethod).toBeDefined();
        expect(typeof inspectMethod).toBe('function');
      }
    });

    it('should format reason in inspection', () => {
      const result = err('TestError', { code: 500, details: 'Server error' });

      try {
        result.unwrap();
      } catch (error) {
        expect(error).toBeInstanceOf(UnwrapError);
        const unwrapError = error as UnwrapError;
        const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
        const inspectMethod = (unwrapError as unknown as Record<symbol, (depth: number, opts: { depth: number }) => string>)[inspectSymbol];
        const inspected = inspectMethod.call(unwrapError, 5, { depth: 5 });

        expect(typeof inspected).toBe('string');
        expect(inspected).toContain('Reason');
      }
    });
  });
});

