import { TreeHelper } from './tree-helper';
import { COMPLEX_TREE_OPTIONS, DEFAULT_OPTIONS } from './constant';
import {
  TreeItem,
  TreeNode,
  ComplexTreeOptions,
  TreeShapeItem,
  ComplexTreeParams,
} from './interface';
import { getLabelWithLevel, invariant } from './utils';

class ComplexTreeHelper extends TreeHelper implements ComplexTreeOptions {
  readonly labelKey: string = 'name';

  constructor(
    { items, options }: ComplexTreeParams = {
      items: [],
      options: { ...COMPLEX_TREE_OPTIONS },
    },
  ) {
    super({
      items,
      options: {
        ...DEFAULT_OPTIONS,
        ...options,
      },
    });

    if (typeof options?.labelKey === 'string' && options.labelKey.length) {
      this.labelKey = options?.labelKey;
    }
  }

  filter(
    filterFun: (node: TreeItem) => boolean,
    nodes: TreeItem[] = this.rootNodes,
  ) {
    let index = nodes.length;
    while (--index >= 0) {
      const node = nodes[index];
      if (node[this.childrenKey]?.length) {
        this.filter(filterFun, node[this.childrenKey]);
      }
      if (!filterFun(node)) {
        node.splice(index, 1);
      }
    }
  }

  visitParent(item: TreeItem, callback: (node: TreeNode) => void) {
    const parent = this.nodeById.get(item[this.parentIdKey]);
    if (parent) {
      callback(parent);
      this.visitParent(parent.data, callback);
    }
  }

  getTreeShapeSelectItems(
    {
      withRoot = true,
      disableProp = '',
    }: {
      withRoot: boolean;
      disableProp: string | ((node: TreeItem) => boolean);
    } = {
      withRoot: true,
      disableProp: '',
    },
  ): TreeShapeItem[] {
    const { idKey, labelKey, childrenKey } = this;

    const visitNode = function (
      node: TreeItem,
      level: number,
      structure: TreeShapeItem[] = [],
    ) {
      const value = node[idKey];
      const label = node[labelKey];
      const item: TreeShapeItem = {
        label,
        value,
        level,
        disabled: false,
        labelWithLevel: getLabelWithLevel({ label, level }),
      };

      if (disableProp) {
        if (typeof disableProp === 'function') {
          item.disabled = disableProp(node);
        } else if (typeof disableProp === 'string') {
          item.disabled = node[disableProp] ?? false;
        }
      }

      structure.push(item);
      const children = node[childrenKey];
      if (children) {
        for (let i = 0, len = children.length; i < len; i++) {
          visitNode(children[i], level + 1, structure);
        }
      }
      return structure;
    };
    const treeStructure: TreeShapeItem[] = visitNode(
      this.getRootItems()[0],
      0,
      [],
    );
    if (!withRoot) {
      treeStructure.splice(0, 1);
    }
    return treeStructure;
  }

  getMovableToParentItems(rootItems: TreeItem[], movingItems: TreeItem[]) {
    invariant(
      !Array.isArray(movingItems) || movingItems.length === 0,
      'Please select can move items',
    );
    const parentId = movingItems[0][this.parentIdKey];
    const movingIds = movingItems.map(x => x[this.idKey]);

    const visitChildren = (parent: TreeItem, children: TreeItem[]) => {
      if (!children?.length) {
        return;
      }
      children.forEach((child: TreeItem) => {
        if (movingIds.indexOf(child[this.idKey]) >= 0) {
          return;
        }
        if (this.isLeafItem(child)) {
          return;
        }
        const item: Record<string, TreeItem> = {};
        item[this.childrenKey] = [];
        for (const key in child) {
          if (
            child.hasOwnProperty(key) &&
            key !== this.childrenKey &&
            key !== this.parentIdKey
          ) {
            item[key] = child[key];
          }
        }
        visitChildren(item, child[this.childrenKey]);
        if (item[this.childrenKey].length || item[this.idKey] !== parentId) {
          parent[this.childrenKey].push(item);
        }
      });
    };

    const ret = { [this.childrenKey]: [] };
    visitChildren(ret, rootItems);
    return ret[this.childrenKey];
  }
}

export { ComplexTreeHelper };
