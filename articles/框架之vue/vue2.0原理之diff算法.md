# vue2.0原理之diff算法

## 前言

diff算法是vue性能优秀的策略之一，所以对diff算法的学习既能够帮助我们深入vue，也能让我们更高效地使用框架，发挥其最大价值。

## vue中的数据结构

完整的vue应用是由多种树嵌套而成：

+ 按照组件分类 - 组件树
+ 按照虚拟DOM分类 - 虚拟DOM树
+ 按照真实DOM分类 - 真实DOM树

**组件树**

![组件树](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-component-tree.png)

**虚拟DOM树**  

![虚拟DOM树](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-vnode-tree.png)

**真实DOM树**

![真实DOM树](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-dom-tree.png)

**嵌套关系**

![关联树](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-relate-tree.png)

总结如下：

1. 每个组件都有着自己的一颗虚拟DOM树；
2. 子组件相对于父组件而言，它既是组件树的组件节点，又是父组件的虚拟DOM树的虚拟dom节点的组件实例componentInstance
3. diff算法只会发生在受影响的虚拟DOM树中（局部）

## diff源码

### 启动组件diff

响应式数据发生变更时，会执行vm._update的执行：

```js
Vue.prototype._update = function (vnode, hydrating) {
    ...
    var prevVnode = vm._vnode;
    ...
    if (!prevVnode) {
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
        vm.$el = vm.__patch__(prevVnode, vnode);
    }
    ...
}
```

从代码可以看出，`__patch__` 接收`新树`和`旧树`，没错，diff的核心代码就在__patch__当中。

### sameVnode

在此之前，我们需要先学习一下vue关于vnode相等的判断条件，判断的严格性将影响diff的效率，vue的设计很好的把握了这个度。

```js
    ...
    function sameVnode (a, b) {
        return (
            a.key === b.key && (
                (
                    a.tag === b.tag &&
                    a.isComment === b.isComment &&
                    isDef(a.data) === isDef(b.data) &&
                    sameInputType(a, b)
                ) || (
                    isTrue(a.isAsyncPlaceholder) &&
                    a.asyncFactory === b.asyncFactory &&
                    isUndef(b.asyncFactory.error)
                )
            )
        )
    }
    ...
```

### patch

上述的__patch__方法和patch方法是同一个，我们看看patch的关键代码：

```js
    ...
    return function patch (oldVnode, vnode, hydrating, removeOnly) {
        ...
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        }else {
            ...
        }
        ...
    }
    ...
```

如果新旧vnode相同，才有做diff的必要；如果新旧vnode不一致，直接用新vnode把旧vnode整体替换掉。

### patchVnode

省略掉一些复杂的判断，只留关键的判断条件：

```js
    ...
    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
        if (oldVnode === vnode) {
            return
        }
        ...
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        ...
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) {
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
                }
            } else if (isDef(ch)) {
                {
                    checkDuplicateKeys(ch);
                }
                if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '');
                }
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            } else if (isDef(oldCh)) {
                removeVnodes(oldCh, 0, oldCh.length - 1);
            } else if (isDef(oldVnode.text)) {
                nodeOps.setTextContent(elm, '');
            }
        } else if (oldVnode.text !== vnode.text) {
            nodeOps.setTextContent(elm, vnode.text);
        }
        ...
    }
    ...
```

vnode的diff有两个维度：是否有文本、是否有子节点

大概整理了以下情况：

| oldVnode | vnode | 处理 |
| :----: | :----: | :----: |
| 有文本 | 无文本 | 清空文本 |
| 有文本 | 有文本 | 比较不同后，更新文本 |
| 有子节点 | 有子节点 | updateChildren子节点 |
| 有子节点 | 无子节点 | 删除子节点对应的真实dom |
| 无子节点 | 有子节点 | 渲染子节点成真实dom后挂载到el上 |

### updateChildren

以下是更新子节点的代码：

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    var canMove = !removeOnly;

    {
        checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) { //条件1
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) { //条件2
            oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) { //条件3
            patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) { //条件4
            patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { //条件5
            patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { //条件6
            patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (isUndef(oldKeyToIdx)) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = isDef(newStartVnode.key)
                ? oldKeyToIdx[newStartVnode.key]
                : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
            if (isUndef(idxInOld)) { //条件7
                createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            } else {
                vnodeToMove = oldCh[idxInOld];
                if (sameVnode(vnodeToMove, newStartVnode)) { //条件8
                    patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                    oldCh[idxInOld] = undefined;
                    canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                } else { //条件9
                    createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                }
            }
            newStartVnode = newCh[++newStartIdx];
        }
    }
    if (oldStartIdx > oldEndIdx) { //条件10
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) { //条件11
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
}
```

子节点是数组，这个方法的核心算法可以概括为两个数组的比较，同时使用递归将层级向下移动。

#### 举一个涵盖所有比较的例子

oldVode.children = `['a', 'b', 'c', 'd']`
newVode.children = `['a', 'e', 'c', 'd', 'b', 'f']`

![快照1](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot1.png)

符合“条件3”，真实dom不进行任何变动，两个左指针都右移。之后展示如下：

![快照2](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot2.png)

符合“条件7”，创建新的真实dom，并插入到旧节点的开始指针之前：

![快照3](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot3.png)

符合“条件8”，旧节点的相应dom前移，图解如下：

![快照4](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot4.png)

符合“条件10”，旧节点的相应dom前移，图解如下：

![快照5](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot5.png)


https://segmentfault.com/a/1190000008782928
https://juejin.cn/post/6844903607913938951
https://blog.csdn.net/lunahaijiao/article/details/86741739