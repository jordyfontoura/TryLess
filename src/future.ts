import { Result } from "./result";

export type Future<T, E=unknown> = Promise<Result<T, E>>;

