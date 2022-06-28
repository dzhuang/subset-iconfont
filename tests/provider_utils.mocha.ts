'use strict';

const assert = require('assert');
import {
  compareVersionNumbers,
  validateSubsetType,
} from '../src/providers/utils';

describe('providers/utils/compareVersionNumbers', () => {
  // ref http://jsfiddle.net/ripper234/Xv9WL/28/
  it('should work compareVersionNumbers', () => {
    assert(compareVersionNumbers('1.7.1', '1.7.10') < 0);
    assert(compareVersionNumbers('1.6.1', '1.7.10') < 0);
    assert(compareVersionNumbers('1.6.20', '1.7.10') < 0);
    assert(compareVersionNumbers('1.7.1', '1.7.10') < 0);
    assert(compareVersionNumbers('1.7', '1.7.0') < 0);
    assert(compareVersionNumbers('1.7', '1.8.0') < 0);

    assert(compareVersionNumbers('1.7.10', '1.7.1') > 0);
    assert(compareVersionNumbers('1.7.10', '1.6.1') > 0);
    assert(compareVersionNumbers('1.7.10', '1.6.20') > 0);
    assert(compareVersionNumbers('1.7.0', '1.7') > 0);
    assert(compareVersionNumbers('1.8.0', '1.7') > 0);

    assert(compareVersionNumbers('1.7.10', '1.7.10') === 0);
    assert(compareVersionNumbers('1.7', '1.7') === 0);

    assert(isNaN(compareVersionNumbers('1.7', '1..7')));
    assert(isNaN(compareVersionNumbers('1.7', 'Bad')));
    assert(isNaN(compareVersionNumbers('1..7', '1.7')));
    assert(isNaN(compareVersionNumbers('Bad', '1.7')));
  });
});

describe('providers/utils/validateSubsetType (values of options not tested)', () => {
  it('should not work validating when the value is not an array', () => {
    assert.equal(validateSubsetType('foo'), false);
  });
  it('should not work validating if the array contains non-string and none object value', () => {
    assert.equal(validateSubsetType(['icon1', 1]), false);
  });
  it('should work when the value is an array of strings', () => {
    assert.equal(validateSubsetType(['icon1', 'icon2']), true);
  });
});
