import { TreeKey } from './interface';

/**
 * 检测错误并抛出
 * @param condition 是否抛出错误
 * @param errorMsg
 */
export const invariant = (condition: boolean, errorMsg: string) => {
  if (condition) {
    throw new Error(errorMsg);
  }
};

interface GetFixParamsForStringParams {
  val?: string;
  defaultVal: string;
}

const getFixedParamForString = ({
  val,
  defaultVal,
}: GetFixParamsForStringParams): string => {
  if (typeof val !== 'string') {
    return defaultVal;
  }
  if (val.length === 0) {
    return defaultVal;
  }
  return val;
};

export interface VisitTreeParams<T> {
  treeRootList: T[];
  callback?: (val: T) => void;
  childrenKey?: string;
}

export const visitTree = <T extends { [key: string]: any }>(
  { treeRootList, callback, childrenKey = 'children' }: VisitTreeParams<T> = {
    treeRootList: [],
    childrenKey: 'children',
  },
) => {
  if (!callback) {
    return;
  }

  if (!Array.isArray(treeRootList) || treeRootList.length === 0) {
    return;
  }

  const finalChildKey: string = getFixedParamForString({
    val: childrenKey,
    defaultVal: 'children',
  });

  const stack: T[] = [...treeRootList];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    callback(current);
    const children = current[finalChildKey];

    if (Array.isArray(children) && children.length > 0) {
      stack.push(...children);
    }
  }
};

export interface FindItemFromTreeParams<T> {
  treeRootList: T[];
  id: TreeKey;
  idKey?: string;
  childrenKey?: string;
}

export const findTreeNodeById = <T extends { [key: string]: any }>({
  treeRootList,
  id,
  idKey = 'id',
  childrenKey = 'children',
}: FindItemFromTreeParams<T>): null | T => {
  if (!Array.isArray(treeRootList) || treeRootList.length === 0) {
    return null;
  }

  if (!id) {
    return null;
  }

  const finalIdKey: string = getFixedParamForString({
    val: idKey,
    defaultVal: 'id',
  });

  const finalChildKey: string = getFixedParamForString({
    val: childrenKey,
    defaultVal: 'children',
  });

  const stack: T[] = [...treeRootList];
  while (stack.length) {
    const current: T | undefined = stack.pop();
    if (!current) {
      continue;
    }
    if (current[finalIdKey] === id) {
      return current;
    }
    const children = current[finalChildKey];
    if (Array.isArray(children) && children.length > 0) {
      stack.push(...children);
    }
  }

  return null;
};
