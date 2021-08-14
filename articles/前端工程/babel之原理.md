# babel之原理

## 什么是babel

> Babel 是一个 JavaScript 编译器。

这意味着开发人员可以使用 `下一代语法` 进行编程，而不用考虑浏览器对语法的支持情况。

## 抽象语法树

> 抽象语法树（AST），是源代码的抽象语法结构的树状表现形式。

从定义中我们可以到，AST是用来描述编程语言语法结构的，这种描述是通过树的数据结构来完成的。所以，学习AST的相关知识，有助于我们更好的了解javascript这门语言。

前端社区中已经有了AST树结构的非官方规范-[estree](https://github.com/estree/estree)，这个规范比较宏观地定义了语法的的结构，并没有跟细致地划分和定义。所以babel基于estree进行了修改，修改后的规范看[这里](https://github.com/babel/babylon/blob/master/ast/spec.md)。

这里提供两个小工具，可在线查看解析语法树：

+ [astexplorer](https://astexplorer.net/)
+ [esprima](https://esprima.org/demo/parse.html)

如果想要深入学习AST，学习和记忆 `estree` 和 `estree修改版` 是必不可少的步骤。

## 编译过程

Babel转码的过程分三个阶段：解析(parse)、转换(transform)、生成(generate)。

![编译过程](https://raw.githubusercontent.com/gouwen666/Blog/master/images/babel-principle-process.awebp)

### 解析

解析是 `源代码生成AST` 的过程。解析的过程分为两个阶段：词法分析、语法分析。

#### 词法分析

词法分析是从上至下、从左至右逐个字符地扫描源代码，生成一个个单词符号（称之为token）的过程。

源代码经过词法扫描器扫描，输出：关键字、标识符、常数、运算符、界符等类型的token。

+ 关键字：程序定义的具有特殊含义的标识符，例如：if...else...、class、in、while等。符号确定
+ 标识符：表示各种变量的名字。符号不定
+ 常数：表示各种具体的值，常数都有着其对应的类型：Number、String、Boolean等。符号不定
+ 运算符：用来组成表达式，例如：+、-、*、/等。符号确定
+ 界符：用来划定代码区域，例如：()、{}、,、;等。符号确定

举个例子：

```js
var name = 'test';
```

词法解析后：

```js
var tokens = [
    {
        "type": "Keyword",
        "value": "var"
    },
    {
        "type": "Identifier",
        "value": "name"
    },
    {
        "type": "Punctuator",
        "value": "="
    },
    {
        "type": "String",
        "value": "'test'"
    },
    {
        "type": "Punctuator",
        "value": ";"
    }
];
```

有了tokens，语法分析时在遇到 `Keyword-var` 便处理为声明变量，遇到 `Punctuator-分号` 处理为语句结束。这就是词法分析的目的所在，为语法分析提前准备数据。

#### 语法分析

语法分析：是使用词法分析后的产物，生成语法树（AST）的过程。

举个例子：

```js
var name = 'test';
```

语法分析后：

```js
var ast = {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "name"
                    },
                    "init": {
                        "type": "Literal",
                        "value": "test",
                        "raw": "'test'"
                    }
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script"
}
```

可以看到一行语句已经形成了树状的结构。



https://www.babeljs.cn/docs/babel-core
https://juejin.cn/post/6844903769805701128#heading-2
https://juejin.cn/post/6844903769805701128#heading-5
https://github.com/babel/babylon/blob/6.x/README.md
https://github.com/babel/babylon










