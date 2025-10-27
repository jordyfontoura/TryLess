# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.5] - 2025-10-27

### Changed
- Migrated documentation examples from `.then(ok, errReject())` pattern to `resultfy()` for improved readability

### Documentation
- Refactored all promise handling examples to use `resultfy()` as the recommended approach
- Added comparison highlighting benefits of `resultfy()` over `.then(ok, errReject())`
- Enhanced `resultfy` section with best practices and clearer examples
- Maintained `errReject` documentation for complex promise chain scenarios
- Updated JSDoc docstrings in source code:
  - `resultfy`: Marked as "Recommended approach" with improved examples showing custom error messages
  - `errReject`: Added note to prefer `resultfy()` for simple cases, with comparison examples
  - `IResult` type: Updated example to use `resultfy()` instead of try-catch pattern

## [1.5.4] - 2025-10-27

### Changed
- Enhanced NPM keywords for better package discoverability and SEO optimization
- Added strategic keywords: `result-type`, `type-safe`, `functional-programming`, `railway-oriented`, `async-error-handling`, `promise`, `no-throw`, `either`, `option`, `monad`, `error-management`, `exception-handling`, `fp`, `functional`, `nodejs`, `zero-dependencies`
- Updated package description from generic to more compelling: "Type-safe error handling for TypeScript without try-catch hell"

### Documentation
- Improved package metadata to increase visibility in NPM search results

## [1.5.3] - 2025-10-27

### Added
- `IResult` type for type-safe result handling with success and error types
- Runtime module for Node.js environment detection
- Custom inspect function for `UnwrapError` with Node.js support
- Tests for `IUnknownError`, `IUnknownOk`, `IUnknownErr`, and `IUnknownOkErr` type utilities
- TypeScript configuration for test types with type-checking capabilities
- Comprehensive test script in package.json covering unit, integration, and type tests
- Version validation in publish workflow (ensures package.json matches git tag)
- CHANGELOG entry verification before publishing
- Type checking step in publish workflow
- Automated test results upload on failure for easier debugging
- CI success job for better branch protection integration
- Playwright browser caching in both CI and publish workflows
- Playwright browser installation step in CI workflow

### Changed
- Migrated testing framework from Jest to Vitest for better performance and DX
- Optimized CI workflow with parallel job execution (lint, typecheck, and tests run simultaneously)
- Added multi-version Node.js testing (Node 18, 20, and 22) to ensure compatibility across LTS versions
- Implemented intelligent Playwright browser cache to reduce CI execution time
- Enhanced publish workflow with comprehensive validation steps
- Reordered test execution in CI workflow for improved clarity and consistency
- Updated Playwright browser installation to use pnpm filter for better dependency management
- Configured Turbo for test dependencies

### Fixed
- Updated Vitest configuration to include specific test directories for better test organization
- Improved type annotations in unwrap-error tests for enhanced type safety

## [1.4.3] - 2024-XX-XX

### Added
- Core `ok()` and `err()` functions for creating Results
- `Ok` and `Err` classes with full type safety
- `resultfy()` helper to wrap functions and promises
- `errReject()` helper for promise rejection handling
- `okFulfilled()` helper for data transformation
- Rich stack traces for error debugging
- Method chaining support: `andThen`, `orElse`, `unwrapOr`, `unwrapOrElse`
- Type guards: `isOk()` and `isErr()`
- Comprehensive test suite
- TypeScript support with full type inference
- CommonJS and ESM module exports

### Documentation
- JSDoc comments for all public APIs
- Examples for common use cases
- Integration examples with Zod validation

[Unreleased]: https://github.com/jordyfontoura/tryless/compare/v1.5.5...HEAD
[1.5.5]: https://github.com/jordyfontoura/tryless/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/jordyfontoura/tryless/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/jordyfontoura/tryless/compare/v1.4.3...v1.5.3
[1.4.3]: https://github.com/jordyfontoura/tryless/releases/tag/v1.4.3

