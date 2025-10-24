import { expectTypeOf, test, describe } from 'vitest';
import {
  ok,
  err,
  type IResult,
  type IOkOf,
  type IOkDataOf,
  type IErrOf,
  type IErrReasonOf,
  type Err,
  type Ok,
} from '../../src';

describe('IResult type inference', () => {
  test('should infer correct types from object mapping', () => {
    type UserResult = IResult<
      { id: number; name: string },
      {
        NotFound: string;
        InvalidEmail: { email: string };
        Underage: { age: number };
      }
    >;

    // Test Ok data extraction
    expectTypeOf<IOkDataOf<UserResult>>().toEqualTypeOf<{
      id: number;
      name: string;
    }>();

    // Test Ok type extraction
    expectTypeOf<IOkOf<UserResult>>().toEqualTypeOf<
      Ok<{ id: number; name: string }>
    >();
  });

  test('should infer correct types from Err union', () => {
    type ParseResult = IResult<number, Err<'ParseError', string>>;

    expectTypeOf<IOkDataOf<ParseResult>>().toEqualTypeOf<number>();
    expectTypeOf<IErrOf<ParseResult>>().toEqualTypeOf<
      Err<'ParseError', string>
    >();
  });

  test('should infer error reason types correctly', () => {
    type UserResult = IResult<
      { id: number },
      {
        NotFound: string;
        InvalidEmail: { email: string };
        Underage: { age: number };
      }
    >;

    // Test specific error reason extraction
    expectTypeOf<IErrReasonOf<UserResult, 'NotFound'>>().toEqualTypeOf<
      string
    >();
    expectTypeOf<
      IErrReasonOf<UserResult, 'InvalidEmail'>
    >().toEqualTypeOf<{ email: string }>();
    expectTypeOf<IErrReasonOf<UserResult, 'Underage'>>().toEqualTypeOf<{
      age: number;
    }>();

    // Test all error reasons
    expectTypeOf<IErrReasonOf<UserResult>>().toEqualTypeOf<
      string | { email: string } | { age: number }
    >();
  });
});

describe('ok() type inference', () => {
  test('should create Ok with correct type', () => {
    const result = ok({ id: 1, name: 'John' });

    expectTypeOf(result.success).toEqualTypeOf<true>();
    expectTypeOf(result.data).toEqualTypeOf<{ id: number; name: string }>();
  });

  test('should handle primitive types', () => {
    const numResult = ok(42);
    expectTypeOf(numResult.data).toEqualTypeOf<number>();

    const strResult = ok('hello');
    expectTypeOf(strResult.data).toEqualTypeOf<string>();

    const boolResult = ok(true);
    expectTypeOf(boolResult.data).toEqualTypeOf<boolean>();
  });

  test('should handle undefined', () => {
    const result = ok();
    expectTypeOf(result.data).toEqualTypeOf<undefined>();
  });

  test('should handle null', () => {
    const result = ok(null);
    expectTypeOf(result.data).toEqualTypeOf<null>();
  });
});

describe('err() type inference', () => {
  test('should create Err with correct types', () => {
    const result = err('NotFound', 'User not found');

    expectTypeOf(result.success).toEqualTypeOf<false>();
    expectTypeOf(result.error).toEqualTypeOf<'NotFound'>();
    expectTypeOf(result.reason).toEqualTypeOf<string>();
  });

  test('should handle complex reason types', () => {
    const result = err('ValidationError', {
      field: 'email',
      message: 'Invalid format',
    });

    expectTypeOf(result.error).toEqualTypeOf<'ValidationError'>();
    expectTypeOf(result.reason).toEqualTypeOf<{
      field: string;
      message: string;
    }>();
  });

  test('should handle undefined reason', () => {
    const result = err('Error');

    expectTypeOf(result.error).toEqualTypeOf<'Error'>();
    expectTypeOf(result.reason).toEqualTypeOf<undefined>();
  });
});

describe('Result type narrowing', () => {
  test('should narrow Ok type correctly', () => {
    type UserResult = IResult<{ id: number }, { NotFound: string }>;
    const result = ok({ id: 1 }) as UserResult;

    if (result.success) {
      expectTypeOf(result.data).toEqualTypeOf<{ id: number }>();
      // @ts-expect-error - error property should not exist on Ok
      result.error;
    }
  });

  test('should narrow Err type correctly', () => {
    type UserResult = IResult<{ id: number }, { NotFound: string }>;
    const result = err('NotFound', 'User not found') as UserResult;

    if (!result.success) {
      expectTypeOf(result.error).toEqualTypeOf<'NotFound'>();
      expectTypeOf(result.reason).toEqualTypeOf<string>();
      // @ts-expect-error - data property should not exist on Err
      result.data;
    }
  });
});

describe('Method return types', () => {
  test('unwrap() should return correct type', () => {
    const result = ok({ id: 1, name: 'John' });
    const data = result.unwrap();

    expectTypeOf(data).toEqualTypeOf<{ id: number; name: string }>();
  });

  test('unwrapOr() should return correct type', () => {
    type UserResult = IResult<{ id: number }, { NotFound: string }>;
    const result = err('NotFound', 'Not found') as UserResult;
    const data = result.unwrapOr({ id: 0 });

    expectTypeOf(data).toEqualTypeOf<{ id: number }>();
  });

  test('map() should transform types correctly', () => {
    const result = ok(42);
    const mapped = result.map((data) => data.toString());

    expectTypeOf(mapped).toEqualTypeOf<string>();
  });
});

