# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation in README
- GitHub Actions workflows for CI/CD
- Publishing guide for contributors

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

[Unreleased]: https://github.com/jordyfontoura/tryless/compare/v1.4.3...HEAD
[1.4.3]: https://github.com/jordyfontoura/tryless/releases/tag/v1.4.3

