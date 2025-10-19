import { okFulfilled } from '../../src';

/**
 * Tests for the okFulfilled helper function
 */
describe('okFulfilled', () => {
  describe('basic usage', () => {
    it('should map data and return a success result', () => {
      const map = (data: number) => data * 2;
      const result = okFulfilled(map)(5);

      expect(result.success).toBe(true);
      expect(result.data).toBe(10);
    });

    it('should work with string transformation', () => {
      const map = (data: string) => data.toUpperCase();
      const result = okFulfilled(map)('hello');

      expect(result.success).toBe(true);
      expect(result.data).toBe('HELLO');
    });

    it('should work with object transformation', () => {
      const map = (data: { value: number }) => ({ doubled: data.value * 2 });
      const result = okFulfilled(map)({ value: 21 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ doubled: 42 });
    });
  });

  describe('currying', () => {
    it('should be curried', () => {
      const double = okFulfilled((n: number) => n * 2);

      expect(typeof double).toBe('function');

      const result1 = double(5);
      const result2 = double(10);

      expect(result1.data).toBe(10);
      expect(result2.data).toBe(20);
    });

    it('should allow reusing the mapper function', () => {
      const addPrefix = okFulfilled((name: string) => `User: ${name}`);

      const result1 = addPrefix('Alice');
      const result2 = addPrefix('Bob');

      expect(result1.data).toBe('User: Alice');
      expect(result2.data).toBe('User: Bob');
    });
  });

  describe('promise chains', () => {
    it('should work in promise chains', async () => {
      const result = await Promise.resolve(42)
        .then(okFulfilled((n) => n * 2));

      expect(result.success).toBe(true);
      expect(result.data).toBe(84);
    });

    it('should chain multiple transformations', async () => {
      const result = await Promise.resolve(10)
        .then(okFulfilled((n) => n * 2))
        .then((r) => r.success ? r.data : 0)
        .then(okFulfilled((n) => n + 5));

      expect(result.success).toBe(true);
      expect(result.data).toBe(25);
    });

    it('should work with async data', async () => {
      async function fetchData() {
        return { value: 42 };
      }

      const result = await fetchData()
        .then(okFulfilled((data) => data.value));

      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });
  });

  describe('type transformations', () => {
    it('should transform number to string', () => {
      const toString = okFulfilled((n: number) => String(n));
      const result = toString(42);

      expect(result.success).toBe(true);
      expect(result.data).toBe('42');
      expect(typeof result.data).toBe('string');
    });

    it('should transform object to array', () => {
      const toArray = okFulfilled((obj: { a: number; b: number }) => [obj.a, obj.b]);
      const result = toArray({ a: 1, b: 2 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([1, 2]);
    });

    it('should extract property from object', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const getName = okFulfilled((user: User) => user.name);
      const result = getName({ id: 1, name: 'Alice', email: 'alice@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toBe('Alice');
    });
  });

  describe('complex transformations', () => {
    it('should handle array map operations', () => {
      const doubleAll = okFulfilled((numbers: number[]) => numbers.map(n => n * 2));
      const result = doubleAll([1, 2, 3, 4, 5]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([2, 4, 6, 8, 10]);
    });

    it('should handle array filter operations', () => {
      const filterEven = okFulfilled((numbers: number[]) => numbers.filter(n => n % 2 === 0));
      const result = filterEven([1, 2, 3, 4, 5, 6]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([2, 4, 6]);
    });

    it('should compose multiple operations', () => {
      const processData = okFulfilled((numbers: number[]) =>
        numbers
          .filter(n => n > 0)
          .map(n => n * 2)
          .reduce((sum, n) => sum + n, 0)
      );

      const result = processData([-1, 1, 2, 3]);

      expect(result.success).toBe(true);
      expect(result.data).toBe(12); // (1 + 2 + 3) * 2 = 12
    });
  });
});

