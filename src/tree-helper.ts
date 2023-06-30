import { DEFAULT_OPTIONS } from './constant';
import {
  ItemMappingFun,
  TreeItem,
  TreeKey,
  TreeNode,
  TreeOptions,
  TreeParams,
} from './interface';
import { findTreeNodeById, invariant, visitTree } from './utils';

class TreeHelper implements TreeOptions {
  readonly idKey: string = 'id';

  readonly parentIdKey: string = 'parentId';

  readonly childrenKey: string = 'children';

  readonly labelKey: string = 'name';

  protected readonly nodeById: Map<TreeKey, TreeNode> = new Map();

  protected readonly rootNodes: TreeNode[] = [];

  constructor(
    { items, options }: TreeParams = {
      items: [],
      options: { ...DEFAULT_OPTIONS },
    },
  ) {
    const { idKey, parentIdKey, childrenKey, isLeafItem, labelKey } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.idKey = idKey!;
    this.parentIdKey = parentIdKey!;
    this.labelKey = labelKey!;
    this.childrenKey = childrenKey!;

    if (isLeafItem && typeof isLeafItem === 'function') {
      this.isLeafItem = isLeafItem;
    }

    if (!Array.isArray(items) || !items.length) {
      return;
    }
    items.forEach(item => {
      const node = { id: item[idKey], data: item };
      this.nodeById.set(node.id, node);
    });

    items.forEach(item => {
      this.addNode(this.nodeById.get(item[idKey])!);
    });
  }

  isLeafItem = (item: TreeItem) => {
    return !item[this.childrenKey]?.length;
  };

  visit({
    node,
    callback,
  }: {
    node?: TreeNode;
    callback: (value: TreeNode) => void;
  }) {
    invariant(
      !callback || typeof callback !== 'function',
      'visit callback must be function',
    );
    visitTree<TreeNode>({
      treeRootList: node ? [node] : this.rootNodes,
      callback,
    });
  }

  addNode(node: TreeNode) {
    const parent = this.nodeById.get(node.data[this.parentIdKey]);

    if (parent) {
      node.parent = parent;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      if (node.parent) {
        delete node.parent;
      }
      this.rootNodes.push(node);
    }

    if (!this.nodeById.get(node.id)) {
      this.visit({
        node,
        callback: (x: TreeNode) => {
          this.nodeById.set(x.id, x);
        },
      });
    }
    return this;
  }

  private getMappingItem({
    itemMapping,
    item,
  }: {
    itemMapping?: ItemMappingFun;
    item: TreeItem;
  }) {
    if (!itemMapping) {
      return item;
    }
    const ret = itemMapping(item);
    const { childrenKey } = this;
    ret[childrenKey] = item[childrenKey];
    return ret;
  }

  public getRootItems(itemMapping?: (item: TreeItem) => TreeItem) {
    const itemById = new Map();
    const rootItems: TreeItem[] = [];

    this.visit({
      callback: (node: TreeNode) => {
        const item = { ...node.data };
        item[this.childrenKey] = [];
        const parentItem = itemById.get(item[this.parentIdKey]);

        const current = this.getMappingItem({
          itemMapping,
          item,
        });

        if (parentItem) {
          parentItem[this.childrenKey].push(current);
        } else {
          rootItems.push(current);
        }

        itemById.set(node.id, item);
      },
    });
    return rootItems;
  }

  public getNodeById(id: string) {
    return this.nodeById.get(id);
  }

  private indexOf(nodes: TreeNode[], id: TreeKey) {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return -1;
    }
    return nodes.findIndex(node => node.id === id);
  }

  addItem(item: TreeItem) {
    item[this.childrenKey] = [];
    const node = {
      data: item,
      id: item[this.idKey],
    };
    this._addNode(node);
    return node;
  }

  setItem(item: TreeItem) {
    const node = this.getNodeById(item[this.idKey]);
    if (!node) {
      return this.addItem(item);
    }

    for (const key in item) {
      if (
        item.hasOwnProperty(key) &&
        key !== this.childrenKey &&
        key !== this.idKey &&
        key !== this.parentIdKey
      ) {
        node.data[key] = item[key];
      }
    }
    return node;
  }

  private _addNode(node: TreeNode) {
    const parent = this.nodeById.get(node.data[this.parentIdKey]);
    if (parent) {
      node.parent = parent;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    } else {
      if (node.parent) {
        delete node.parent;
      }
      this.rootNodes.push(node);
    }

    if (!this.nodeById.get(node.id)) {
      this.visit({
        node,
        callback: (x: TreeNode) => {
          this.nodeById.set(x.id, x);
        },
      });
    }
    return this;
  }

  removeItem(item: TreeItem) {
    const node = this.nodeById.get(item[this.idKey]);
    invariant(!node, `Cannot found node for item[${JSON.stringify(item)}]`);
    this._removeNode(node!);
    return node;
  }

  _removeNode(node: TreeNode) {
    if (node.parent) {
      const index = this.indexOf(node.parent.children!, node.id);
      node.parent.children!.splice(index, 1);
    } else {
      const index = this.indexOf(this.rootNodes, node.id);
      this.rootNodes.splice(index, 1);
    }
    this.visit({
      node,
      callback: (x: TreeNode) => {
        this.nodeById.delete(x.id);
      },
    });
    return this;
  }

  move(id: TreeKey, parentId: TreeKey) {
    const node = this.nodeById.get(id);
    if (!node) {
      return;
    }
    this._removeNode(node);
    node.data[this.parentIdKey] = parentId;
    this._addNode(node);
  }

  getItemByIdFromItems(items: TreeItem[], id: TreeKey) {
    return findTreeNodeById({
      treeRootList: items,
      id,
      idKey: this.idKey,
      childrenKey: this.childrenKey,
    });
  }
}

export { TreeHelper };
