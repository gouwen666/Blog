# babel之babel-traverse

根据 [babel-traverse](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#babel-traverse) 的描述：

> Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。

ast是描述语法的树型结构的数据，如果我们想 `遍历` ast，并且能够进入 `对应类型` 的处理，我们便可以通过该模块来完成。

## 用法

```js
    traverse(ast, visitors);
```

visitors包含：

    + 全局访问者：每一个类型都会被该访问者访问。
    + 特定类型访问者：某种类型的语法节点才会被对应类型的访问者访问。

**示例：**

```js
traverse(ast, {
    enter(path) {
        //每一个节点都会进入这里
    },
    FunctionDeclaration: {
        enter(path) {
            //进入函数声明节点
        },
        exit(path) {
            //退出函数声明节点
        }
    },
    Identifier(path) {
        //进入标识符节点
    }
});
```

除此之外，每一个 `path` 对象也具有traverse方法，可以 `进入当前path下的所有语法节点`，示例如下：

```js
traverse(ast, {
    enter(path) {
        //每一个节点都会进入这里
    },
    FunctionDeclaration(path) {
        path.traverse({
            enter(path) {
                //...
                console.log(this.param1);
            },
            Identifier(path) {
                //...
                console.log(this.param2);
            }
        }, {
            param1: 1,
            param2: 'hello world'
        });
    }
});
```

文档对于traverse没有细致的讲解和说明，我们可以通过看源码的 [测试用例](https://github.com/babel/babel/tree/master/packages/babel-traverse/test) 来学习和了解它。

## traverse.hasType()

该方法用来判断ast是否具有某种类型的语法节点。

**用法：**

```js
    traverse.hasType(ast, type);
```

**示例：**

```js
    const code = `
        var text = 'hello world';
    `;
    const ast = babylon.parse(code);
    traverse.hasType(ast, 'Program'); // true
    traverse.hasType(ast, 'Identifier'); // true
    traverse.hasType(ast, 'ObjectExpression'); // false
```

## path.get()

该方法返回包含ast节点的属性值的NodePath实例。

**用法：**

```js
    path.get('expression'); //获取ExpressionStatement节点的expression属性
    path.get('left'); //获取BinaryExpression节点的left
```

**示例：**

假设如下代码：

```js
    num1 === num2;
```

该代码会生成如下的AST节点：

```js
    {
        type: 'ExpressionStatement',
        expression: {
            type: 'BinaryExpression',
            left: {
                type: 'Identifier',
                name: 'num1'
            },
            right: {
                type: 'Identifier',
                name: 'num2'
            },
            operator: '==='
        }
    }
```

我们在访问器中访问如下：

```js
    traverse(ast, {
        BinaryExpression(path) {
            console.log(path.get('left'));
            // 输出：
            // {key: 'left', node: IdentifierNode, type: 'Identifier', ...pathOtherProps}
            console.log(path.get('type'));
            // 输出：
            // {key: 'type', node: 'BinaryExpression', type: '', ...pathOtherProps}
        }
    })
```

不难发现，返回出来的path对象中：

    + `node` 为值
    + `key` 为参数
    + 如果node是一个ast节点，`type` 为该节点的类型。
    + 其他属性也会根据node是否为ast节点，以及其节点类型而赋有相应的值。

## path.stop()

该方法可以阻止traverse。

**示例：**

```js
    const code = `
        function square(n) {
            return n * n;
        }
    `;

    const ast = babylon.parse(code);

    traverse(ast, {
        Identifier(path) {
            console.log(path.node.name);
        }
    })
    // 输出：
    // square
    // n
    // n
    // n
```

如果加上 path.stop() ,示例如下：

```js
    const code = `
        function square(n) {
            return n * n;
        }
    `;

    const ast = babylon.parse(code);

    traverse(ast, {
        Identifier(path) {
            console.log(path.node.name);
            path.stop();
        }
    })
    // 输出：
    // square
```

语法树遍历自此停止，stop阻断了后续的所有遍历。

## path.replaceWith()

该方法可以将语法节点替换成另外一中语法节点

**用法：**

```js
    path.replaceWidth(astNode);
```

**示例：**

如果想要将字符串替换为字面量对象，我们可以这样实现：

```js
    const code = `
        var foo = 'test';
    `;
    const replacement = {
        'type': 'ObjectExpression',
        'properties': [{
            'type': 'ObjectProperty',
            'key': {
                'type': 'Identifier',
                'name': 'num'
            },
            'value': {
                'type': 'NumericLiteral',
                'value': 233
            }
        }]
    }
    let ast = babylon.parse(code);

    traverse(ast, {
        VariableDeclarator(path) {
            if(path.node.id.name === 'foo') {
                path.traverse({
                    StringLiteral(path) {
                        path.replaceWith(replacement);
                    }
                })
            }
        }
    });

    generate(ast, {}, code); // {code: "\nvar foo = {\n    num: 233\n};"}
```

## path.isType()

isType 不是某个确定的api，之所以这样声明，是为了表达一类判断类型的API，例如：

```js
    // type：ObjectExpression
    path.isObjectExpression();

    // type：ObjectProperty
    path.isObjectProperty();

    // type：Identifier
    path.isIdentifier();
```

所有的类型都有其对应的类型判断API。


