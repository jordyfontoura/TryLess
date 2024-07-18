import * as result from './result';
import * as future from './future';
import * as utilities from './utilities';
import * as extensios from './extensios';

export * from './result';
export * from './future';
export * from './utilities';
export * from './extensios';

export default {
  ...result,
  ...future,
  ...utilities,
  ...extensios
}