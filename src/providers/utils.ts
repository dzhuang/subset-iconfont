import { SubsetItem } from '../types/SubsetItem';

type ValidateSubsetType = (object: unknown) => boolean;

export const validateSubsetType: ValidateSubsetType = (object) => {
  if (!Array.isArray(object)) return false;
  for (const item of object) {
    if ('string' !== typeof item) {
      return false;
    }
  }
  return true;
};

/**
 * A function comparing version of packages
 * ref: http://jsfiddle.net/ripper234/Xv9WL/28/
 */
export const compareVersionNumbers = (v1: string, v2: string) => {
  const v1parts = v1.split('.');
  const v2parts = v2.split('.');

  const isPositiveInteger = (x: string) => {
    // http://stackoverflow.com/a/1019526/11236
    return /^\d+$/.test(x);
  };

  // First, validate both numbers are true version numbers
  const validateParts = (parts: string[]) => {
    for (let i = 0; i < parts.length; ++i) {
      if (!isPositiveInteger(parts[i])) {
        return false;
      }
    }
    return true;
  };

  if (!validateParts(v1parts) || !validateParts(v2parts)) {
    return NaN;
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length === i) {
      return 1;
    }

    if (v1parts[i] === v2parts[i]) {
      continue;
    }
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    return -1;
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
};

// compare subsetItem by icon name
export const subsetItemSorter = (itemA: SubsetItem, itemB: SubsetItem) => {
  return itemA < itemB ? -1 : 1;
};
