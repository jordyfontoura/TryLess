declare const require: ((module: string) => object) | undefined;

/**
 * Detects if the code is running in a Node.js environment.
 * Checks for the existence of the `require` function.
 */
export const isNodeEnvironment = typeof require !== 'undefined';

/**
 * Gets the inspect function, importing it only in Node.js environment.
 * @returns The inspect function or undefined if not available (browser)
 */
function getInspect(): ((value: unknown, options?: object) => string) | undefined {
  if (!isNodeEnvironment) {
    return undefined;
  }

  try {
    if (typeof require !== 'undefined') {
      const util = require('util');
      if ('inspect' in util && typeof util.inspect === 'function') {
        return util.inspect as (value: unknown, options?: object) => string;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * The util.inspect function from Node.js, or undefined in browser environments.
 * Loaded once when the module is imported.
 */
export const inspect = getInspect();

