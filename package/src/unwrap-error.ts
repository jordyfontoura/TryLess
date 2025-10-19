import { inspect } from 'util';
import type { IUnknownOkErr } from './result/types';
import { UnwrapErrorName } from './result/constants';

/**
 * Error thrown when attempting to unwrap a Result that contains an error.
 */
export class UnwrapError extends Error {
  public error: string;
  public reason?: unknown;

  constructor(result: IUnknownOkErr, caller: (...args: unknown[]) => unknown, customMessage?: string, customError?: string) {
    let message = customMessage || `Could not unwrap result`;

    const error = customError || ('error' in result ? result.error : UnwrapErrorName);
    message += ` '${error}'`
    const obj: { stack?: string } = {}
    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(obj, caller);
    }
    message += obj.stack?.replace('Error\n', '\n');

    if ('stack' in result) {
      message += ` ${result.stack?.replace('Error\n', '\n\nError created at\n')}`;
    }
    super(message);

    this.stack = obj.stack;

    this.error = customError || ('error' in result ? result.error : UnwrapErrorName);
    if ("reason" in result) {
      this.reason = result.reason;
    }

    this.name = "UnwrapError";
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth: number, opts: { depth: number | null }) {
    if (depth < 0) {
      return this.message;
    }
    let msg = this.message;
    if (this.reason) {
      const newOpts = { ...opts, depth: opts.depth === null ? null : opts.depth - 1 };
      msg += `\n\nReason ${inspect(this.reason, newOpts)}`;
    }
    return msg;
  }
}

