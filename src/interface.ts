export type TreeKey = string | number;

export type TreeItem = Record<string, any>;

export interface TreeNode {
  id: TreeKey;
  data: TreeItem;
  parent?: TreeNode;
  children?: TreeNode[];
}

export interface TreeOptions {
  idKey: string;
  parentIdKey: string;
  labelKey: string;
  childrenKey: string;
  isLeafItem?: (node: TreeItem) => boolean;
}

export type ItemMappingFun = (item: TreeItem) => TreeItem;

export interface TreeParams {
  items: TreeItem[];
  options?: Partial<TreeOptions>;
}

export interface TreeShapeItem {
  label: string;
  value: TreeItem;
  level: number;
  disabled: boolean;
  labelWithLevel: string;
}
