# babel之babel-types

根据 [babel-types](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#babel-types) 的描述：

> Babel Types模块是一个用于 AST 节点的 Lodash 式工具库（译注：Lodash 是一个 JavaScript 函数工具库，提供了基于函数式编程风格的众多工具函数）， 它包含了构造、验证以及变换 AST 节点的方法。

AST 语法节点是比较复杂的数据结构，该库提供了很多方便的工具函数，使开发人员能够更高效地处理这些节点。

## types.identifier()

该方法创建一个新的 `标识符（Identifier）` 节点。

### 用法：

```js
    node = types.identifier(name);
```

### 示例：

创建一个名称为test的变量：

```js
    testNode = types.identifier('test');
```

### types.isIdentifier()

该方法判断节点是否为 `标识符（Identifier）` 类型。

### 用法：

```js
    testNode = types.identifier('test');
    types.isIdentifier(testNode); // 输出：true
    types.isIdentifier(testNode, {name: 'test'}); // 输出：true
    types.isIdentifier(testNode, {name: 'name'}); // 输出：false
```