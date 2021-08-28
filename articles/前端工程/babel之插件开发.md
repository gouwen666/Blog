# babel之插件开发

## babel-traverse

根据 [babel-traverse](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#babel-traverse) 所描述的那样：

> Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。

说明：

ast是描述语法的树型结构的数据，如果我们想 `遍历` ast，并且能够进入 `对应类型` 的处理，我们便可以通过该模块来完成。

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

学习babel-traverse最重要的是要掌握 `path对象` 的属性和方法，我认为，最好的方式是看源码的[测试用例](https://github.com/babel/babel/tree/master/packages/babel-traverse/test)。




https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/README.md