# babel之babel-traverse

根据 [babel-traverse](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#babel-traverse) 的描述：

> Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。

ast是描述语法的树型结构的数据，如果我们想 `遍历` ast，并且能够进入 `对应类型` 的处理，我们便可以通过该模块来完成。

## 用法

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

文档对于traverse没有细致的讲解和说明，可以通过看源码的 [测试用例](https://github.com/babel/babel/tree/master/packages/babel-traverse/test)

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

## path.replaceWith()

该方法可以将语法节点替换成另外一中语法节点

**用法：**

```js
    path.replaceWidth(astNode);
```

**示例：**

如果想要将字符串替换为字面量对象：

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
            debugger
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

