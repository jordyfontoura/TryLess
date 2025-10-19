import { errReject, ok } from '../../src';

/**
 * Tests for the errReject helper function
 */
describe('errReject', () => {
  describe('basic usage', () => {
    it('should create an error result with given reason', () => {
      const createError = errReject('FetchError');
      const result = createError('Network unavailable');

      expect(result.success).toBe(false);
      expect(result.error).toBe('FetchError');
      expect(result.reason).toBe('Network unavailable');
    });

    it('should handle different error types', () => {
      const createValidationError = errReject('ValidationError');
      const result = createValidationError('Email is required');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ValidationError');
      expect(result.reason).toBe('Email is required');
    });

    it('should handle object as reason', () => {
      const createError = errReject('ServerError');
      const reason = { code: 500, message: 'Internal server error' };
      const result = createError(reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ServerError');
      expect(result.reason).toEqual(reason);
    });

    it('should handle Error instances as reason', () => {
      const createError = errReject('UnknownError');
      const error = new Error('Something went wrong');
      const result = createError(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('UnknownError');
      expect(result.reason).toBe(error);
    });
  });

  describe('currying', () => {
    it('should be curried', () => {
      const onReject = errReject('FetchError');

      expect(typeof onReject).toBe('function');

      const result1 = onReject('Network timeout');
      const result2 = onReject('Connection refused');

      expect(result1.error).toBe('FetchError');
      expect(result1.reason).toBe('Network timeout');
      expect(result2.error).toBe('FetchError');
      expect(result2.reason).toBe('Connection refused');
    });

    it('should allow reusing the error type', () => {
      const createNotFoundError = errReject('NotFound');

      const userNotFound = createNotFoundError('User not found');
      const postNotFound = createNotFoundError('Post not found');

      expect(userNotFound.error).toBe('NotFound');
      expect(postNotFound.error).toBe('NotFound');
      expect(userNotFound.reason).toBe('User not found');
      expect(postNotFound.reason).toBe('Post not found');
    });
  });

  describe('promise rejection handling', () => {
    it('should handle promise rejections', async () => {
      const promise = Promise.reject('Network error');
      const result = await promise.then(ok, errReject('FetchError'));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('FetchError');
        expect(result.reason).toBe('Network error');
      }
    });

    it('should work in promise chains', async () => {
      async function failingFetch() {
        throw new Error('Failed to fetch');
      }

      const result = await failingFetch()
        .then(ok, errReject('user:fetch-error'));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('user:fetch-error');
        expect(result.reason).toBeInstanceOf(Error);
      }
    });

    it('should handle successful promises', async () => {
      const promise = Promise.resolve(42);
      const result = await promise.then(ok, errReject('FetchError'));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });
  });

  describe('real-world scenarios', () => {
    it('should handle fetch API errors', async () => {
      // Simulate fetch failure
      const mockFetch = () => Promise.reject(new Error('Network request failed'));

      const result = await mockFetch()
        .then(ok, errReject('network:error'));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('network:error');
        expect(result.reason).toBeInstanceOf(Error);
      }
    });

    it('should handle API response errors', async () => {
      interface ApiError {
        status: number;
        message: string;
      }

      const mockApiCall = () => Promise.reject({
        status: 404,
        message: 'Resource not found',
      });

      const result = await mockApiCall()
        .then(ok, errReject('api:error'));

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.reason as ApiError;
        expect(error.status).toBe(404);
        expect(error.message).toBe('Resource not found');
      }
    });

    it('should work with chained async operations', async () => {
      const fetchUser = () => Promise.reject('User service unavailable');
      const fetchPosts = () => Promise.resolve(['post1', 'post2']);

      const userResult = await fetchUser()
        .then(ok, errReject('user:fetch-error'));

      const postsResult = await fetchPosts()
        .then(ok, errReject('posts:fetch-error'));

      expect(userResult.success).toBe(false);
      expect(postsResult.success).toBe(true);
    });
  });

  describe('error stack traces', () => {
    it('should capture stack trace', () => {
      const createError = errReject('TestError');
      const result = createError('test reason');

      expect(result.stack).toBeDefined();
      expect(typeof result.stack).toBe('string');
    });

    it('should have different stack traces for different calls', () => {
      const createError = errReject('TestError');
      const result1 = createError('reason1');
      const result2 = createError('reason2');

      expect(result1.stack).toBeDefined();
      expect(result2.stack).toBeDefined();
      // Stack traces should be different as they're called from different locations
      expect(result1.stack).not.toBe(result2.stack);
    });
  });
});

