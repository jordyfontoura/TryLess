import { resultfy } from '../../src';
import { describe, it, expect } from 'vitest';

/**
 * Tests for the resultfy helper function
 */
describe('resultfy', () => {
  describe('synchronous functions', () => {
    describe('successful execution', () => {
      it('should wrap a function that returns a value', () => {
        const sum = (a: number, b: number) => a + b;
        const safeSum = resultfy(sum);
        const result = safeSum(3, 4);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(7);
        }
      });

      it('should work with string operations', () => {
        const toUpperCase = (str: string) => str.toUpperCase();
        const safeToUpperCase = resultfy(toUpperCase);
        const result = safeToUpperCase('hello');

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('HELLO');
        }
      });

      it('should work with object returns', () => {
        const createUser = (name: string, age: number) => ({ name, age });
        const safeCreateUser = resultfy(createUser);
        const result = safeCreateUser('Alice', 25);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({ name: 'Alice', age: 25 });
        }
      });

      it('should work with array operations', () => {
        const filterEven = (numbers: number[]) => numbers.filter(n => n % 2 === 0);
        const safeFilterEven = resultfy(filterEven);
        const result = safeFilterEven([1, 2, 3, 4, 5]);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual([2, 4]);
        }
      });
    });

    describe('error handling', () => {
      it('should catch thrown errors', () => {
        const throwingFn = () => {
          throw new Error('Test error');
        };
        const safeFn = resultfy(throwingFn);
        const result = safeFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('unknown');
          expect(result.reason).toBeInstanceOf(Error);
        }
      });

      it('should catch errors with custom error type', () => {
        const throwingFn = () => {
          throw new Error('Test error');
        };
        const safeFn = resultfy(throwingFn, 'custom-error');
        const result = safeFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('custom-error');
          expect(result.reason).toBeInstanceOf(Error);
        }
      });

      it('should handle division by zero', () => {
        const divide = (a: number, b: number) => {
          if (b === 0) throw new Error('Division by zero');
          return a / b;
        };
        const safeDivide = resultfy(divide);
        const result = safeDivide(10, 0);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('unknown');
        }
      });

      it('should catch string throws', () => {
        const throwString = () => {
          throw 'String error';
        };
        const safeFn = resultfy(throwString);
        const result = safeFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe('String error');
        }
      });

      it('should catch object throws', () => {
        const throwObject = () => {
          throw { code: 500, message: 'Error' };
        };
        const safeFn = resultfy(throwObject);
        const result = safeFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toEqual({ code: 500, message: 'Error' });
        }
      });
    });
  });

  describe('asynchronous functions', () => {
    describe('successful execution', () => {
      it('should wrap async function with success', async () => {
        const asyncFn = async () => 'async result';
        const safeAsyncFn = resultfy(asyncFn);
        const result = await safeAsyncFn();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('async result');
        }
      });

      it('should work with async operations', async () => {
        const fetchData = async (id: number) => {
          return { id, name: `User ${id}` };
        };
        const safeFetch = resultfy(fetchData);
        const result = await safeFetch(1);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({ id: 1, name: 'User 1' });
        }
      });

      it('should handle delayed promises', async () => {
        const delayed = async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'delayed result';
        };
        const safeDelayed = resultfy(delayed);
        const result = await safeDelayed();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('delayed result');
        }
      });
    });

    describe('error handling', () => {
      it('should catch async rejections', async () => {
        const asyncFn = async () => {
          throw new Error('Async error');
        };
        const safeAsyncFn = resultfy(asyncFn);
        const result = await safeAsyncFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('unknown');
          expect(result.reason).toBeInstanceOf(Error);
        }
      });

      it('should catch async rejections with custom error', async () => {
        const asyncFn = async () => {
          throw new Error('Async error');
        };
        const safeAsyncFn = resultfy(asyncFn, 'async-error');
        const result = await safeAsyncFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('async-error');
          expect(result.reason).toBeInstanceOf(Error);
        }
      });

      it('should handle promise rejections', async () => {
        const rejectingFn = async () => {
          return Promise.reject('Rejection reason');
        };
        const safeRejectingFn = resultfy(rejectingFn);
        const result = await safeRejectingFn();

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe('Rejection reason');
        }
      });
    });
  });

  describe('direct promise wrapping', () => {
    it('should wrap a promise directly', async () => {
      const promise = Promise.resolve(42);
      const result = await resultfy(promise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should wrap a rejected promise', async () => {
      const promise = Promise.reject('Error reason');
      const result = await resultfy(promise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('unknown');
        expect(result.reason).toBe('Error reason');
      }
    });

    it('should wrap a promise with custom error', async () => {
      const promise = Promise.reject('Error reason');
      const result = await resultfy(promise, 'custom-error');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('custom-error');
        expect(result.reason).toBe('Error reason');
      }
    });
  });

  describe('function parameters preservation', () => {
    it('should preserve function parameters', () => {
      const multiply = (a: number, b: number, c: number) => a * b * c;
      const safeMultiply = resultfy(multiply);
      const result = safeMultiply(2, 3, 4);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(24);
      }
    });

    it('should work with optional parameters', () => {
      const greet = (name: string, greeting = 'Hello') => `${greeting}, ${name}!`;
      const safeGreet = resultfy(greet);

      const result1 = safeGreet('Alice');
      const result2 = safeGreet('Bob', 'Hi');

      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data).toBe('Hello, Alice!');
      }
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data).toBe('Hi, Bob!');
      }
    });

    it('should work with rest parameters', () => {
      const sum = (...numbers: number[]) => numbers.reduce((a, b) => a + b, 0);
      const safeSum = resultfy(sum);
      const result = safeSum(1, 2, 3, 4, 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(15);
      }
    });
  });

  describe('edge cases', () => {
    it('should throw when called with invalid type', () => {
      expect(() => {
        resultfy(123 as unknown as Parameters<typeof resultfy>[0]);
      }).toThrow('fn must be a function or a promise');
    });

    it('should handle undefined return', () => {
      const returnUndefined = () => undefined;
      const safeFn = resultfy(returnUndefined);
      const result = safeFn();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should handle null return', () => {
      const returnNull = () => null;
      const safeFn = resultfy(returnNull);
      const result = safeFn();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should capture stack traces', () => {
      const throwingFn = () => {
        throw new Error('Test error');
      };
      const safeFn = resultfy(throwingFn);
      const result = safeFn();

      if (!result.success) {
        expect(result.stack).toBeDefined();
        expect(typeof result.stack).toBe('string');
      }
    });
  });

  describe('real-world scenarios', () => {
    it('should handle JSON parsing', () => {
      const parseJSON = (str: string): unknown => JSON.parse(str);
      const safeParseJSON = resultfy(parseJSON);

      const validResult = safeParseJSON('{"name":"Alice"}');
      if ('success' in validResult) {
        expect(validResult.success).toBe(true);
        if (validResult.success) {
          expect(validResult.data).toEqual({ name: 'Alice' });
        }
      }

      const invalidResult = safeParseJSON('invalid json');
      if ('success' in invalidResult) {
        expect(invalidResult.success).toBe(false);
        if (!invalidResult.success) {
          expect(invalidResult.error).toBe('unknown');
        }
      }
    });

    it('should handle array access', () => {
      const getFirst = (arr: unknown[]) => {
        if (arr.length === 0) throw new Error('Array is empty');
        return arr[0];
      };
      const safeGetFirst = resultfy(getFirst);

      const result1 = safeGetFirst([1, 2, 3]);
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data).toBe(1);
      }

      const result2 = safeGetFirst([]);
      expect(result2.success).toBe(false);
    });

    it('should handle API calls', async () => {
      const fetchUser = async (id: number) => {
        if (id < 0) throw new Error('Invalid ID');
        return { id, name: `User ${id}` };
      };
      const safeFetchUser = resultfy(fetchUser, 'user:fetch-error');

      const validResult = await safeFetchUser(1);
      expect(validResult.success).toBe(true);

      const invalidResult = await safeFetchUser(-1);
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error).toBe('user:fetch-error');
      }
    });
  });
});

