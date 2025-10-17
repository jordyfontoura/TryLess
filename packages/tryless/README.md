# Tryless

Tryless is a lightweight utility library for handling function and promise results in a consistent way. It provides helper functions to wrap synchronous and asynchronous operations, returning standardized result objects that indicate success or failure. This helps in writing robust code by avoiding try/catch clutter and ensuring consistent error handling.

## Installation

Using npm:
```bash
npm install tryless
```

Using yarn:
```bash
yarn add tryless
```

Using pnpm:
```bash
pnpm add tryless
```

Using bun:
```bash
bun add tryless
```

## Overview

Tryless uses a result type abstraction with two main outcomes:
- **Success Result**: Returned when a function executes successfully. It may contain data.
- **Failure Result**: Returned when an error occurs. Contains an error message and optionally a reason.

The library exports several helper functions and types to handle these cases seamlessly.

## Basic Usage

### Creating Success and Failure Results

Use the helper functions `ok` and `err` to create success and failure results.

```typescript
import { ok, err } from 'tryless';

// Success with data
const successResult = ok(42); // { success: true, data: 42 }

// Success without data
const emptySuccess = ok(); // { success: true }

// Failure with error message
const failureResult = err('NotFound'); // { success: false, error: 'NotFound' }

// Failure with error message and additional reason
const detailedFailure = err('ValidationError', 'Invalid input'); // { success: false, error: 'ValidationError', reason: 'Invalid input' }
```

### Wrapping Functions with resultfy

The `resultfy` function wraps any synchronous or asynchronous function (or promise) and returns a result type.

#### Example with a Synchronous Function

```typescript
import { resultfy } from 'tryless';

const add = (x: number, y: number) => x + y;
const wrappedAdd = resultfy(add);

const result = wrappedAdd(3, 4);
if (result.success) {
  console.log('Sum:', result.data); // Output: Sum: 7
} else {
  console.error('Error:', result.error);
}
```

#### Example with an Asynchronous Function

```typescript
import { resultfy } from 'tryless';

const asyncOperation = async () => {
  // Simulate asynchronous work
  return 'data fetched';
};

const wrappedAsync = resultfy(asyncOperation);

wrappedAsync().then(result => {
  if (result.success) {
    console.log('Data:', result.data); // Output: Data: data fetched
  } else {
    console.error('Error:', result.error);
  }
});
```

### Mapping and Unwrapping Results

Tryless provides utility functions like `unwrap`, `unwrapError`, `okFulfilled`, `errReject`, `isSuccess`, and `isFailure` to further process the results.

#### Unwrapping Success

```typescript
import { ok, unwrap } from 'tryless';

const result = ok(100);
const data = unwrap(result); // data will be 100
```

#### Handling Errors

```typescript
import { err, unwrapError } from 'tryless';

const result = err('NotFound');
// unwrapError will throw if the error does not match the expected value.
try {
  const errorData = unwrapError(result, 'NotFound');
  console.error('Error occurred:', errorData.error);
} catch (e) {
  console.error('Unexpected result', e);
}
```

## API Reference

- **ok<T>(data?: T)**
  - Creates a success result. If data is provided, returns an object with the data; otherwise, returns a success result without data.

- **err<E extends string, C = never>(error: E, reason?: C)**
  - Creates an error result with a required error message and an optional reason.

- **okFulfilled<T, R = T>(map: (data: T) => R): (data: T) => ISuccess<R>**
  - Transforms data for a success result using the provided mapping function.

- **errReject<E extends string>(error: E): (reason: unknown) => IFailureWithReason<E, unknown>**
  - Returns a function that wraps a given error reason into an error result with the specified error message.

- **resultfy**
  - Wraps a function or promise to return a result object instead of throwing exceptions. It supports both synchronous and asynchronous functions.
  - You can also pass a custom onReject handler to customize error handling for rejected promises.

- **unwrap**
  - Unwraps the success data from a result. It returns the default value if provided, or throws a `ResultError` upon failure.

- **unwrapError**
  - Unwraps and validates the expected error from a failure result, and throws a `ResultError` if the expected error does not match.

- **isSuccess** and **isFailure**
  - Type-guard functions to differentiate between success and failure result types.

## Testing

Tryless includes comprehensive unit tests for all functions. To run the tests, execute:

```bash
npm test
```

## Contributing

Contributions are welcome! Open an issue or pull request to discuss improvements or bug fixes.

## License

[MIT](LICENSE)