# vue2.0原理之diff算法

## 前言

vue框架对于diff算法的设计是其性能优秀的原因之一，所以对于diff算法的学习能够帮助我们更高效地使用框架，发挥其最大价值。如果将来某一天遇到同样的树问题，我们也能使用同样的策略来优化树结构的处理。

## vue中的数据结构

一个完整的vue应用是由 `多种树` 嵌套而成：

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
3. diff算法只会发生在受影响的虚拟DOM树（局部）中，并非是整个虚拟DOM树。

## diff源码

我们从响应式数据发生变更开始，按照代码的执行顺序一步一步去分析。

### 数据发生变更

响应式数据发生变更时，会执行vm._update的执行。此时的vm是vue应用中某个组件的实例，这也证明了其是局部diff的，而非整体diff。

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

在此之前，我们先学习一下vue关于vnode相等的判断条件，判断的严格性将影响diff的效率，vue很好地把握了这个度。

这也是vue设计diff的策略之一：**适当的判等条件能够减少diff的执行次数**。

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

上述的__patch__方法和patch方法是同一个方法，我们看看patch的关键代码：

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

整理如下：

| oldVnode | vnode | 处理 |
| :----: | :----: | :----: |
| 有文本 | 无文本 | 清空文本 |
| 有文本 | 有文本 | 比较不同后，更新文本 |
| 有子节点 | 有子节点 | 通过updateChildren更新子节点 |
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

为了避免繁琐的文字描述，提前声明一些简称：

| 简称 | 描述 |
| :----: | :----: |
| oldStartVnode | 旧子节点上开始指针指向的节点 |
| oldEndVnode | 旧子节点上结束指针指向的节点 |
| newStartVnode | 新子节点上开始指针指向的节点 |
| newEndVnode | 新子节点上结束指针指向的节点 |
| oldStartDom | 旧子节点上开始指针指向的节点对应的真实dom |
| oldEndDom | 旧子节点上结束指针指向的节点对应的真实dom |
| newStartDom | 新子节点上开始指针指向的节点对应的真实dom |
| newEndDom | 新子节点上结束指针指向的节点对应的真实dom |


子节点启动diff前的快照是这样子的：

&emsp;

![快照1](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot1.png)

&emsp;

1. 当前快照符合“条件3”：oldStartVnode和newStartVnode相同，意味着当前位置的dom没有任何变动，只需要将oldStartVnode和newStartVnode右移一个位置，移动后快照如下：

&emsp;

![快照2](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot2.png)

&emsp;

2. 当前快照符合“条件7”：newStartVnode在旧树上没有找到，意味着newStartDom是新节点，于是创建新的真实dom，并插入到oldEndVnode之前，同时将newStartVnode右移一个位置。变动后快照如下：

&emsp;

![快照3](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot3.png)

&emsp;

3. 当前快照符合“条件8”：，newStartVnode在旧树上能够找到相同的节点，意味着只是顺序发生了变化，则将newStartDom从原来的位置移动到当前位置，同时将newStartVnode右移一个位置：

&emsp;

![快照4](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot4.png)

&emsp;

4. 当前快照符合“条件6”：newStartVnode和oldEndVnode相同，意味着oldEndDom位置发生了变化，则将oldEndDom从原来的位置移动到oldStartDom之前，图示如下：

&emsp;

![快照5](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot5.png)

&emsp;

5. 当前快照符合“条件2”：在3步处理时，c已经被处理过，并且被置为空，所以直接将oldEndVnode左移

&emsp;

![快照6](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot6.png)

&emsp;

6. 当前快照符合“条件3”：真实dom不需要处理，只需将oldStartVnode和newStartVnode右移一个位置。

&emsp;

![快照6](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot7.png)

&emsp;

7. 因为oldStartVnode超过 oldEndVnode，则退出循环。此时新的子节点还有剩余，则创建其真实dom，添加到dom树上。

&emsp;

![快照6](https://raw.githubusercontent.com/gouwen666/Blog/master/images/vue2.0-diff-snapshot8.png)

&emsp;


在以上的每一步中，一旦节点相同，还会调用 `patchVnode` 方法，递归去比较新旧相等的两个节点。


## 总结

以上为diff算法的全部过程，可以试着debugger去跟踪diff的过程。

## 参考文章

1. https://segmentfault.com/a/1190000008782928
2. https://juejin.cn/post/6844903607913938951
3. https://blog.csdn.net/lunahaijiao/article/details/86741739