import * as errors from './errors';
import * as functions from './functions';

export * from './errors';
export * from './functions';
export default {
  ...errors,
  ...functions,
}