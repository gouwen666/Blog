# ts基础之入门.md

## 基本概念

官网介绍：

> TypeScript是JavaScript类型的超集，它可以编译成纯JavaScript。
> TypeScript可以在任何浏览器、任何计算机和任何操作系统上运行，并且是开源的。

### 超集

定义：如果一个集合S2中的每一个元素都在集合S1中，且集合S1中可能包含S2中没有的元素，则集合S1就是S2的一个超集。

js具备的特性ts都支持，但是ts支持的特性js却不一定支持。ts是js的语言扩展。

ts的出现改变了开发的编码方式，从弱类型的编码习惯变更为强类型的编码风格。这种“强类型”是通过静态检查的方式完成。虽然是ts的语法，但最终运行的还是js代码。所以ts也提供了编译器，负责把ts编译成js。

## 作用

1. 静态校验，可以及早暴露出代码的异常。

2. 类型声明，可以帮助开发人员更好的阅读代码。



https://www.tslang.cn/docs/handbook/classes.html
http://ts.xcatliu.com/basics/type-inference.html
https://juejin.cn/post/6916495590754877453
https://juejin.cn/post/6926794697553739784
https://juejin.cn/post/6844903641829081095