import { expectTypeOf, test, describe } from 'vitest';
import {
  type IResult,
  type IOkOf,
  type IOkDataOf,
  type IErrOf,
  type IErrReasonOf,
  type Err,
  type Ok,
} from '../../src';

describe('IOkOf utility type', () => {
  test('should extract Ok type from Result', () => {
    type UserResult = IResult<{ id: number; name: string }, { NotFound: string }>;
    type UserOk = IOkOf<UserResult>;

    expectTypeOf<UserOk>().toEqualTypeOf<Ok<{ id: number; name: string }>>();
  });

  test('should return never for non-Ok types', () => {
    type NonOk = IOkOf<Err<'Error', string>>;

    expectTypeOf<NonOk>().toEqualTypeOf<never>();
  });
});

describe('IOkDataOf utility type', () => {
  test('should extract data type from Ok', () => {
    type UserResult = IResult<{ id: number; name: string }, { NotFound: string }>;
    type UserData = IOkDataOf<UserResult>;

    expectTypeOf<UserData>().toEqualTypeOf<{ id: number; name: string }>();
  });

  test('should work with primitive types', () => {
    type NumberResult = IResult<number, { Error: string }>;
    type NumberData = IOkDataOf<NumberResult>;

    expectTypeOf<NumberData>().toEqualTypeOf<number>();
  });

  test('should handle complex nested types', () => {
    type ComplexResult = IResult<
      { user: { id: number; profile: { name: string } } },
      { Error: string }
    >;
    type ComplexData = IOkDataOf<ComplexResult>;

    expectTypeOf<ComplexData>().toEqualTypeOf<{
      user: { id: number; profile: { name: string } };
    }>();
  });
});

describe('IErrOf utility type', () => {
  test('should extract specific error type', () => {
    type UserResult = IResult<
      { id: number },
      {
        NotFound: string;
        InvalidEmail: { email: string };
        Underage: { age: number };
      }
    >;

    type NotFoundErr = IErrOf<UserResult, 'NotFound'>;
    expectTypeOf<NotFoundErr>().toEqualTypeOf<Err<'NotFound', string>>();

    type InvalidEmailErr = IErrOf<UserResult, 'InvalidEmail'>;
    expectTypeOf<InvalidEmailErr>().toEqualTypeOf<
      Err<'InvalidEmail', { email: string }>
    >();
  });

  test('should extract all error types when K is not provided', () => {
    type UserResult = IResult<
      { id: number },
      {
        NotFound: string;
        Invalid: number;
      }
    >;

    type AllErrs = IErrOf<UserResult>;
    expectTypeOf<AllErrs>().toEqualTypeOf<
      Err<'NotFound', string> | Err<'Invalid', number>
    >();
  });

  test('should return never for non-existent error', () => {
    type UserResult = IResult<{ id: number }, { NotFound: string }>;
    type NonExistent = IErrOf<UserResult, 'Unauthorized'>;

    expectTypeOf<NonExistent>().toEqualTypeOf<never>();
  });
});

describe('IErrReasonOf utility type', () => {
  test('should extract reason type for specific error', () => {
    type UserResult = IResult<
      { id: number },
      {
        NotFound: string;
        InvalidEmail: { email: string };
        Underage: { age: number };
      }
    >;

    type NotFoundReason = IErrReasonOf<UserResult, 'NotFound'>;
    expectTypeOf<NotFoundReason>().toEqualTypeOf<string>();

    type InvalidEmailReason = IErrReasonOf<UserResult, 'InvalidEmail'>;
    expectTypeOf<InvalidEmailReason>().toEqualTypeOf<{ email: string }>();

    type UnderageReason = IErrReasonOf<UserResult, 'Underage'>;
    expectTypeOf<UnderageReason>().toEqualTypeOf<{ age: number }>();
  });

  test('should extract all reason types as union', () => {
    type UserResult = IResult<
      { id: number },
      {
        NotFound: string;
        InvalidEmail: { email: string };
        Underage: { age: number };
      }
    >;

    type AllReasons = IErrReasonOf<UserResult>;
    expectTypeOf<AllReasons>().toEqualTypeOf<
      string | { email: string } | { age: number }
    >();
  });

  test('should work with complex reason types', () => {
    type ComplexResult = IResult<
      number,
      {
        ValidationError: {
          field: string;
          message: string;
          nested: { code: number };
        };
      }
    >;

    type ValidationReason = IErrReasonOf<ComplexResult, 'ValidationError'>;
    expectTypeOf<ValidationReason>().toEqualTypeOf<{
      field: string;
      message: string;
      nested: { code: number };
    }>();
  });

  test('should return never for non-existent error', () => {
    type UserResult = IResult<{ id: number }, { NotFound: string }>;
    type NonExistentReason = IErrReasonOf<UserResult, 'Unauthorized'>;

    expectTypeOf<NonExistentReason>().toEqualTypeOf<never>();
  });
});

describe('Type utility composition', () => {
  test('should combine utilities for complex type operations', () => {
    type UserResult = IResult<
      { id: number; name: string },
      {
        NotFound: string;
        ValidationError: { field: string; message: string };
      }
    >;

    // Extract data type
    type Data = IOkDataOf<UserResult>;
    expectTypeOf<Data>().toEqualTypeOf<{ id: number; name: string }>();

    // Extract specific error
    type NotFoundErr = IErrOf<UserResult, 'NotFound'>;
    expectTypeOf<NotFoundErr>().toEqualTypeOf<Err<'NotFound', string>>();

    // Extract specific reason
    type ValidationReason = IErrReasonOf<UserResult, 'ValidationError'>;
    expectTypeOf<ValidationReason>().toEqualTypeOf<{
      field: string;
      message: string;
    }>();
  });
});

