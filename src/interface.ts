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
  childrenKey: string;
  isLeafItem?: (node: TreeItem) => boolean;
}

export interface ComplexTreeOptions extends TreeOptions {
  labelKey?: string;
}

export type ItemMappingFun = (item: TreeItem) => TreeItem;

export interface TreeParams {
  items: TreeItem[];
  options?: Partial<TreeOptions>;
}

export interface ComplexTreeParams {
  items: TreeItem[];
  options?: Partial<ComplexTreeOptions>;
}

export interface TreeShapeItem {
  label: string;
  value: TreeItem;
  level: number;
  disabled: boolean;
  labelWithLevel: string;
}
