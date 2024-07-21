Here is an improved version of your README:

# TryLess
TryLess is a TypeScript library designed to simplify error handling and minimize the use of try-catch blocks. The library introduces `Result` and `Future` types that encapsulate both success and error states, along with a set of helper functions to streamline the handling of these results.

## Why Avoid Extensive Use of Try-Catch Blocks?
While try-catch blocks are a common method for handling errors in JavaScript and TypeScript, they can make your code verbose and difficult to read, particularly when dealing with multiple nested try-catch blocks. Consider the following example:

```typescript
async function registerUser(user: User): Promise<void> {
  const email = user.email;

  try {
    const user = await getUserByEmail(email);
  } catch (error) {
    console.error(error);

    if ((error as any).message !== "User not found") {
      try {
        const notifyResult = await notifyAdmin(`Failed to get user by email: ${error}`);
      } catch (notifyError) {
        console.error(notifyError);
        throw new Error(`Failed to notify admin: ${notifyError}`);
      }

      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  if (user) {
    throw new Error('User already exists');
  }

  try {
    const createUserResult = await createUser(user);
  } catch (createUserError) {
    console.error(createUserError);
    throw new Error(`Failed to create user: ${createUserError}`);
  }
}
```

This code is hard to read and maintain due to the nested try-catch blocks and the need to handle different types of errors. TryLess provides a more elegant and concise way to handle errors using the `Result` and `Future` types and utility functions.

## Simplifying with TryLess

If the functions `getUserByEmail` and `createUser` return a `Result` type, the code can be simplified using the `Future` type and utility functions provided by TryLess.

Example:

```typescript
import { ok, fail, Future } from 'tryless';

async function registerUser(user: User): Future<void, string> {
  const email = user.email;
  const userResult = await getUserByEmail(email);

  if (userResult.isFail()) {
    const userError = userResult.reason;
    console.error(userError);

    if (userError.message !== "User not found") {
      const notifyResult = await notifyAdmin(`Failed to get user by email: ${userError}`);

      if (notifyResult.isFail()) {
        return fail(`Failed to notify admin: ${notifyResult.reason}`);
      }

      return fail(`Failed to get user by email: ${userError}`);
    }
  }

  const user = userResult.value;

  if (user) {
    return fail('User already exists');
  }

  const createResult = await createUser(user).unwrapAll();

  if (createResult.isFail()) {
    const createUserError = createResult.reason;

    console.error(createUserError);

    return fail(`Failed to create user: ${createUserError}`);
  }

  return ok();
}
```

This code is much easier to read and understand. The `Future` type encapsulates both success and error states, allowing you to handle both cases in a single return statement. The `ok` and `fail` functions create success and error results, respectively, and the `await` keyword is used to wait for the results of asynchronous operations.

## Features
- Encapsulates success and error states in a single type.
- Provides utility functions to handle results without try-catch blocks.
- Converts regular and async functions to return results.
- Extends promises to return results.

## Installation

Install the library using npm:

```bash
npm install tryless
```

## Getting Started

To get started with TryLess, follow these simple steps:

1. Install the library using the npm command above.
2. Import the necessary functions and types (`ok`, `fail`, `Future`) from the library.
3. Refactor your functions to return `Result` or `Future` types instead of throwing errors.
4. Use the utility functions to handle results in a concise and readable manner.

With TryLess, you can make your error handling code cleaner, more maintainable, and easier to understand.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.