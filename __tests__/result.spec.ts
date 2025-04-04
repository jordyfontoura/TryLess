import { ok, err, okFulfilled, errReject, resultfy, ISuccess, IFailure, IFailureWithReason, IUnknownResult } from '../src/result';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertType<T>(_value: T) { }

describe('types', () => {
  it('should correctly infer types', () => {
    const result1 = ok(42);
    const result2 = err('NotFound');
    const result3 = err('ValidationError', 'Invalid input');
    const result4 = ok(42);
    const result5 = err('Some error', 'Some reason');

    assertType<ISuccess<number>>(result1);
    assertType<IFailure<'NotFound'>>(result2);
    assertType<IFailureWithReason<'ValidationError', string>>(result3);
    assertType<IUnknownResult<number>>(result4);
    assertType<IUnknownResult>(result5);
  });

  it('should correctly infer the success data type', () => {
    const result: ISuccess<number> = ok(42);
    const data = result.data;

    assertType<number>(data);
  });

  it('should correctly infer the error type', () => {
    const result: IFailure<'NotFound'> = err('NotFound');
    const error: 'NotFound' = result.error;
    assertType<'NotFound'>(error);
  });

  it('should correctly infer the reason type', () => {
    const result: IFailureWithReason<'ValidationError', string> = err('ValidationError', 'Invalid input');
    const reason = result.reason;
    assertType<string>(reason);
  });
})

describe('examples', () => {
  interface ICreateUserAttributes {
    name: string;
    email: string;
    age: number;
  }

  interface IUser {
    id: number;
    name: string;
    email: string;
    age: number;
  }

  const db: IUser[] = [
    {
      id: 123,
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 25,
    },
  ]

  function worstFetchUser(email: string): IUser {
    const user = db.find(user => user.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  function createUser(attributes: ICreateUserAttributes) {
    if (!attributes.name) {
      return err('Validation', 'Name is required');
    }

    if (!attributes.email) {
      return err('Validation', 'Email is required');
    }

    if (!attributes.age) {
      return err('Validation', 'Age is required');
    }

    if (attributes.age < 18) {
      return err('Underage', 'User must be at least 18 years old');
    }

    if (!attributes.email.includes('@')) {
      return err('EmailFormat', 'Email must be valid');
    }

    if (attributes.age > 200) {
      return err('AgeLimit', 'Age must be less than 200');
    }

    // Simulate a database operation
    const existingUser = resultfy(worstFetchUser)(attributes.email);

    if (existingUser.success) {
      return err('UserExists', existingUser.data);
    }

    // Simulate a successful user creation
    db.push({ id: 0, ...attributes });

    return ok({ id: 0, ...attributes });
  }

  it('should create a user successfully', () => {
    const attributes: ICreateUserAttributes = {
      name: 'Alice',
      age: 25,
      email: 'alice@example.com',
    }

    const result = createUser(attributes);
    
    if (result.success) {
      assertType<ISuccess<ICreateUserAttributes & {id: number}>>(result);
    } else {
      assertType<IFailureWithReason<string, unknown>>(result);

      if (result.error === 'Validation') {
        assertType<IFailureWithReason<'Validation', string>>(result);
      } else if (result.error === 'UserExists') {
        assertType<IFailureWithReason<'UserExists', { id: number; name: string; email: string; age: number }>>(result);
      }
    }

    expect(result).toEqual({
      success: true,
      data: {
        id: 0,
        ...attributes,
      },
    });
  })
})

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
