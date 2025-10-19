<div align="center">
  <h1>🚀 Tryless</h1>
  <p><strong>Type-safe error handling for TypeScript without try-catch hell</strong></p>
  
  [![npm version](https://img.shields.io/npm/v/tryless.svg)](https://www.npmjs.com/package/tryless)
  [![License](https://img.shields.io/npm/l/tryless.svg)](https://github.com/jordyfontoura/tryless/blob/main/LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
</div>

---

## 🎯 Why Tryless?

Say goodbye to deeply nested try-catch blocks and hello to elegant, type-safe error handling. **Tryless** brings Rust-inspired Result types to TypeScript with a developer experience that just feels right.

**Before (nested try-catch hell):**
```typescript
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    try {
      const json = await response.json();
      try {
        const user = userSchema.parse(json);
        return user;
      } catch (error) {
        throw new Error('Invalid user schema', { cause: error });
      }
    } catch (error) {
      throw new Error('Invalid JSON', { cause: error });
    }
  } catch (error) {
    throw new Error('Fetch failed', { cause: error });
  }
}
```

**After (clean & type-safe):**
```typescript
import { ok, err, errReject } from 'tryless';

async function fetchUser(id: string) {
  const responseResult = await fetch(`/api/users/${id}`)
    .then(ok, errReject('fetch-failed'));
  if (!responseResult.success) return responseResult;

  const jsonResult = await responseResult.data.json()
    .then(ok, errReject('invalid-json'));
  if (!jsonResult.success) return jsonResult;

  const userResult = userSchema.safeParse(jsonResult.data);
  if (!userResult.success) return err('invalid-schema', userResult.error);

  return ok(userResult.data);
}
```

## ✨ Features

- 🎯 **Type-Safe**: Full TypeScript support with discriminated unions
- 🔗 **Chainable**: Elegant API with `andThen`, `orElse`, and more
- 🎨 **Zero Dependencies**: Lightweight and fast
- 🔍 **Rich Stack Traces**: Detailed error tracking for debugging
- 🌊 **Promise-Ready**: Built for async/await workflows
- 🛠️ **Practical Helpers**: `resultfy`, `errReject`, and `okFulfilled` for common patterns
- 🧩 **Composable**: Easy to integrate into existing codebases

## 📦 Installation

```bash
npm install tryless
```

```bash
yarn add tryless
```

```bash
pnpm add tryless
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { ok, err } from 'tryless';

function divide(a: number, b: number) {
  if (b === 0) return err('division-by-zero');
  
  return ok(a / b);
}

const result = divide(10, 2);

if (result.success) {
  console.log(result.data); // 5
} else {
  console.log(result.error); // 'division-by-zero'
}
```

### With Promises

```typescript
import { ok, errReject } from 'tryless';

async function getUser(id: string) {
  // Convert promise rejection to error result
  const result = await fetch(`/api/users/${id}`)
    .then(ok, errReject('user-fetch-failed'));
    
  if (!result.success) {
    return result; // { success: false, error: 'user-fetch-failed', reason: ... }
  }
  
  return result; // { success: true, data: Response }
}
```

### Early Returns Pattern

Tryless promotes clean code with early returns:

```typescript
import { ok, err } from 'tryless';

async function validateAndCreateUser(data: unknown) {
  // Validate email
  if (!data.email) return err('missing-email');
  
  // Check if user exists
  const existingUser = await findUserByEmail(data.email);
  if (existingUser.success) return err('user-already-exists');
  
  // Validate age
  if (data.age < 18) return err('user-underage');
  
  // Create user
  const user = await createUser(data);
  return ok(user);
}
```

## 🎓 Core Concepts

### Ok and Err

The foundation of Tryless: two simple types that represent success and failure.

```typescript
import { ok, err } from 'tryless';

// Success result
const success = ok({ id: 1, name: 'John' });
// { success: true, data: { id: 1, name: 'John' } }

// Error result with message
const failure = err('not-found');
// { success: false, error: 'not-found', reason: undefined }

// Error with additional context
const detailedError = err('validation-failed', { field: 'email', message: 'Invalid format' });
// { success: false, error: 'validation-failed', reason: { field: 'email', ... } }
```

### Checking Results

Use the `success` property to safely narrow types:

```typescript
const result = divide(10, 2);

if (result.success) {
  // TypeScript knows this is Ok<number>
  console.log(result.data); // ✅ Type-safe access
} else {
  // TypeScript knows this is Err
  console.log(result.error); // ✅ Type-safe access
  console.log(result.reason); // ✅ Type-safe access
}
```

## 🛠️ Powerful Helpers

### resultfy

Wrap functions or promises to always return Results instead of throwing:

```typescript
import { resultfy } from 'tryless';

// Wrap a function
const safeDivide = resultfy((a: number, b: number) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
});

const result = safeDivide(10, 2);
// { success: true, data: 5 }

const errorResult = safeDivide(10, 0);
// { success: false, error: 'unknown', reason: Error('Division by zero') }

// Wrap a promise
const safeUser = await resultfy(
  fetch('/api/user').then(r => r.json())
);
```

With custom error messages:

```typescript
const safeFetch = resultfy(
  fetch('/api/data').then(r => r.json()),
  'fetch-error'
);

if (!safeFetch.success) {
  console.log(safeFetch.error); // 'fetch-error'
}
```

### errReject

Perfect for promise chains - converts rejections to error results:

```typescript
import { ok, errReject } from 'tryless';

const result = await fetch('/api/data')
  .then(ok, errReject('network-error'))
  .then(res => res.success ? res.data.json() : res)
  .then(ok, errReject('parse-error'));
```

### okFulfilled

Transform data and wrap in a success result - great for mapping:

```typescript
import { okFulfilled } from 'tryless';

const double = okFulfilled((n: number) => n * 2);
const result = double(5);
// { success: true, data: 10 }

// In promise chains
const users = await fetch('/api/users')
  .then(r => r.json())
  .then(okFulfilled(data => data.users))
  .then(okFulfilled(users => users.map(u => u.name)));
```

## ⚡ Chaining Operations

### andThen

Chain operations that might fail:

```typescript
const result = await getUser(id)
  .andThen(user => getUserPreferences(user.id))
  .andThen(prefs => validatePreferences(prefs));
```

### orElse

Recover from errors:

```typescript
const result = await getUser(id)
  .orElse(error => {
    if (error === 'not-found') {
      return createDefaultUser();
    }
    return err(error);
  });
```

### unwrapOr

Get data or provide a default:

```typescript
const user = getUserById(id).unwrapOr({ id: 0, name: 'Guest' });
```

### unwrapOrElse

Compute a fallback from the error:

```typescript
const value = getPrice(item).unwrapOrElse(error => {
  logError(error);
  return 0;
});
```

## 🎯 Real-World Examples

### API Request with Validation

```typescript
import { ok, err, errReject } from 'tryless';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

async function fetchAndValidateUser(id: string) {
  // Fetch data
  const fetchResult = await fetch(`/api/users/${id}`)
    .then(ok, errReject('network-error'));
  if (!fetchResult.success) return fetchResult;

  // Check response status
  const response = fetchResult.data;
  if (!response.ok) {
    return err('http-error', { status: response.status });
  }

  // Parse JSON
  const jsonResult = await response.json()
    .then(ok, errReject('json-parse-error'));
  if (!jsonResult.success) return jsonResult;

  // Validate schema
  const validation = userSchema.safeParse(jsonResult.data);
  if (!validation.success) {
    return err('validation-error', validation.error);
  }

  return ok(validation.data);
}

// Usage
const userResult = await fetchAndValidateUser('123');

if (userResult.success) {
  console.log('User:', userResult.data);
} else {
  switch (userResult.error) {
    case 'network-error':
      console.error('Network failed:', userResult.reason);
      break;
    case 'http-error':
      console.error('HTTP error:', userResult.reason);
      break;
    case 'validation-error':
      console.error('Invalid data:', userResult.reason);
      break;
  }
}
```

### Database Operations

```typescript
import { ok, err, resultfy } from 'tryless';

async function createUser(data: UserInput) {
  // Validate input
  if (!data.email) return err('missing-email');
  if (!data.name) return err('missing-name');

  // Check if exists
  const existing = await db.findByEmail(data.email);
  if (existing) return err('email-already-exists', { email: data.email });

  // Create user (wrapped to catch DB errors)
  const createResult = await resultfy(
    db.users.insert(data),
    'database-error'
  );

  if (!createResult.success) return createResult;

  return ok(createResult.data);
}
```

### File Operations

```typescript
import { readFile } from 'fs/promises';
import { ok, errReject } from 'tryless';

async function loadConfig(path: string) {
  const fileResult = await readFile(path, 'utf-8')
    .then(ok, errReject('file-read-error'));
  if (!fileResult.success) return fileResult;

  try {
    const config = JSON.parse(fileResult.data);
    return ok(config);
  } catch (error) {
    return err('json-parse-error', error);
  }
}
```

## 📚 API Reference

### Core Functions

#### `ok(data?)`
Creates a success result.

```typescript
ok() // { success: true, data: undefined }
ok(42) // { success: true, data: 42 }
```

#### `err(error?, reason?)`
Creates an error result.

```typescript
err() // { success: false, error: 'unknown', reason: undefined }
err('not-found') // { success: false, error: 'not-found', reason: undefined }
err('validation-failed', details) // { success: false, error: 'validation-failed', reason: details }
```

### Helper Functions

#### `resultfy(fn, error?)`
Wraps functions/promises to return Results.

```typescript
resultfy(dangerousFunction)
resultfy(promise, 'custom-error')
```

#### `errReject(error)`
Converts promise rejections to Err results.

```typescript
promise.then(ok, errReject('fetch-failed'))
```

#### `okFulfilled(mapFn)`
Transforms data and wraps in Ok.

```typescript
okFulfilled((x: number) => x * 2)
```

### Result Methods

#### `.unwrap(customError?)`
Returns data or throws UnwrapError.

#### `.unwrapOr(defaultValue)`
Returns data or default value.

#### `.unwrapOrElse(fn)`
Returns data or computed default.

#### `.andThen(fn)`
Chains operations on success.

#### `.orElse(fn)`
Recovers from errors.

#### `.map(fn)`
Transforms the result.

#### `.isOk()` / `.isErr()`
Type guards for success/error.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [License](https://github.com/jordyfontoura/tryless/blob/main/LICENSE)

## 🌟 Show Your Support

If you find Tryless helpful, please consider:
- ⭐ Starring the repo on GitHub
- 🐦 Sharing it on Twitter
- 📝 Writing about it on your blog

---

<div align="center">
  <p>Made with ❤️ by developers who hate try-catch hell</p>
  <p>
    <a href="https://github.com/jordyfontoura/tryless">GitHub</a> •
    <a href="https://www.npmjs.com/package/tryless">npm</a> •
    <a href="https://github.com/jordyfontoura/tryless/issues">Issues</a>
  </p>
</div>
