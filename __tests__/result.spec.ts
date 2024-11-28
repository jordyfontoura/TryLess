import { ok, err, okFulfilled, errReject, resultfy } from '../src/result';

describe('ok', () => {
  it('should return a success result with data', () => {
    const data = { name: 'Test' };
    const result = ok(data);
    expect(result).toEqual({ success: true, data });
  });
});

describe('err', () => {
  it('should return an error result with just an error message', () => {
    const result = err('NotFound');
    expect(result).toEqual({ success: false, error: 'NotFound' });
  });

  it('should return an error result with an error message and reason', () => {
    const result = err('ValidationError', 'Invalid email');
    expect(result).toEqual({ success: false, error: 'ValidationError', reason: 'Invalid email' });
  });
});

describe('okFulfilled', () => {
  it('should map data and return a success result', () => {
    const map = (data: number) => data * 2;
    const result = okFulfilled(map)(5);
    expect(result).toEqual({ success: true, data: 10 });
  });
});

describe('errReject', () => {
  it('should return a function that returns an error result with the given reason', () => {
    const errorResultFn = errReject('FetchError');
    const result = errorResultFn('Network unavailable');
    expect(result).toEqual({ success: false, error: 'FetchError', reason: 'Network unavailable' });
  });
});

describe('resultfy', () => {
  it('should wrap a synchronous function with a success result', () => {
    const syncFn = (x: number, y: number) => x + y;
    const wrappedFn = resultfy(syncFn);
    expect(wrappedFn(3, 4)).toEqual({ success: true, data: 7 });
  });

  it('should wrap a synchronous function with an error result when an exception is thrown', () => {
    const syncFn = () => { throw new Error('Test error'); };
    const wrappedFn = resultfy(syncFn);
    const result = wrappedFn();
    expect(result.success).toBe(false);
    expect(result.error).toBe('unknown');
    expect(result.reason).toBeInstanceOf(Error);
  });

  it('should wrap a promise function with a success result', async () => {
    const asyncFn = async () => 'async result';
    const wrappedFn = resultfy(asyncFn);
    await expect(wrappedFn()).resolves.toEqual({ success: true, data: 'async result' });
  });

  it('should wrap a promise function with a rejection result', async () => {
    const asyncFn = async () => { throw new Error('Async error'); };
    const wrappedFn = resultfy(asyncFn);
    const result = await wrappedFn();
    expect(result.success).toBe(false);
    expect(result.error).toBe('unknown');
    expect(result.reason).toBeInstanceOf(Error);
  });

  it('should use custom onReject handler for rejected promises', async () => {
    const asyncFn = async () => { throw new Error('Async error'); };
    const onReject = (reason: unknown) => err('CustomError', reason);
    const wrappedFn = resultfy(asyncFn, onReject);
    const result = await wrappedFn();
    expect(result).toEqual({ success: false, error: 'CustomError', reason: expect.any(Error) });
  });

  it('should throw an error when called with an invalid type', () => {
    expect(() => resultfy(123 as unknown as Parameters<typeof resultfy>[0])).toThrow('fn must be a function or a promise');
  });
});
