import amount from './amount';
import cachedThrottle from './cached-throttle';
import crypto from './crypto';
import identity from './identity';
import retry from './retry';
import signature from './signature';
import utils from './utils';

/**
 * Collection of general purpose utility function
 */
export default {
  amount,
  cachedThrottle,
  crypto,
  deepCopy: utils.deepCopy,
  deepSort: utils.deepSort,
  flatten2DimensionsArray: utils.flatten2DimensionsArray,
  getCurrentTimestampInSecond: utils.getCurrentTimestampInSecond,
  identity,
  isString: utils.isString,
  retry,
  signature,
  timeoutPromise: utils.timeoutPromise,
  unique: utils.unique,
  uniqueByProperty: utils.uniqueByProperty,
};
