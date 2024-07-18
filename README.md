# TryLess
TryLess is a TypeScript library designed to simplify error handling and reduce the need for extensive use of try-catch blocks. The library introduces a `Result` type that encapsulates both success and error states, along with a set of helper functions to streamline the handling of results.

## Features
- Encapsulate success and error states in a single type
- Provide utility functions to handle results without try-catch blocks
- Convert regular and async functions to return results
- Extend promises to return results

## Installation
Install the library using npm:

```bash
npm install tryless
```

## Usage
Creating Results
You can create success and error results using the success and error functions.

```typescript
import { ok, error } from 'tryless';

// Creating a success result
const result = ok(1);

// Creating an fail result
const errResult = fail('An error occurred');
```

## Handling Results
TryLess provides several utility functions to handle results:

orDefault(defaultValue: T): T
orElse(fn: (error: E) => U): T | U
orThrow(message?: string): T
andThen(fn: (value: T) => U): IResult<U, E>

```typescript
import { someResultFunction } from 'tryless';

const result = someResultFunction(1)
  .orDefault(2)
  .andThen((value) => value + 1);
```
Example
```typescript
import { IResult, ok, fail, resultifyFunction } from 'tryless';

// Example function
const divide = (a: number, b: number): IResult<number, string> => {
  if (b === 0) {
    return fail('Division by zero');
  }
  return ok(a / b);
};

// Handling the result
const result = divide(10, 2)
  .orDefault(0)
  .andThen((value) => value * 2);

console.log(result); // Output: 10
```

### Asynchronous Functions
You can convert async functions to return results using resultifyAsyncFunction.

```typescript
import { resultifyAsyncFunction } from 'tryless';

const asyncFunction = async (x: number): Promise<number> => {
  if (x < 0) throw new Error('Negative value');
  return x + 1;
};

const resultifiedFunction = resultifyAsyncFunction(asyncFunction);

resultifiedFunction(1).then(([value, reason, isError]) => {
  if (isError) {
    console.error(reason);
  } else {
    console.log(value);
  }
});
```

## Promises
You can convert promises to return results using resultifyPromise or the asResult method on promises.

```typescript
import { resultifyPromise } from 'tryless';

const promise = fetch('https://example.com');

resultifyPromise(promise).then(([value, reason, isError]) => {
  if (isError) {
    console.error(reason);
  } else {
    console.log(value);
  }
});

// Using asResult method
fetch('https://example.com').asResult().then(([value, reason, isError]) => {
  if (isError) {
    console.error(reason);
  } else {
    console.log(value);
  }
});
```

## API
### Types
#### IResult<T, E>
A result type that contains a value, an error, and a boolean indicating if it's an error.

T: Type of the value
E: Type of the error
Functions
```typescript
ok<T, E = unknown>(value: T): ResultOk<T, E>
```
Creates a successful result.
```typescript
fail<E, T = unknown>(error: E): ResultFail<E, T>
```
Creates an error result.
```typescript
resultifyFunction<T, E = unknown, Fn extends (...args: any) => any = () => void>(fn: Fn): (...args: Parameters<Fn>) => IResult<T, E>
```
Converts a function into a result function.
```typescript
resultifyAsyncFunction<T, E = unknown, Fn extends (...args: any) => any = () => void>(fn: Fn): (...args: Parameters<Fn>) => Promise<IResult<T, E>>
```
Converts an async function into a result async function.
```typescript
resultifyPromise<T, E = unknown>(promise: Promise<T>): Promise<IResult<T, E>>
```
Converts a promise into a result promise.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the **MIT** License.