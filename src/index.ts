import * as result from './result';
import * as extensios from './extensios';

export * from './result';
export * from './extensios';

export default {
  ...result,
  ...extensios
}