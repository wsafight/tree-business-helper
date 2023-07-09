import { ComplexTreeOptions, TreeOptions } from './interface';

export const DEFAULT_OPTIONS: TreeOptions = {
  idKey: 'id',
  parentIdKey: 'parentId',
  childrenKey: 'children',
};

export const COMPLEX_TREE_OPTIONS: ComplexTreeOptions = {
  ...DEFAULT_OPTIONS,
  labelKey: 'name',
};

/** 不可见字符串 */
// eslint-disable-next-line no-irregular-whitespace
export const INVISIBLE_CHAR = '　';
