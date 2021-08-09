# vue工程之vue-template-compiler

## 概念

github地址请戳[这里](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler)

该模块可用于将 Vue 2.0 模板预编译为渲染函数（template => ast => render），以避免运行时编译开销和CSP限制。大多数场景下，它是与vue-loader一起使用。开发人员在编写具有非常特定需求的构建工具时，才需要单独使用它。

从官方文档可以看出，这个包是自动生成的，入口文件在[这里](https://github.com/vuejs/vue/blob/dev/src/platforms/web/entry-compiler.js)。原来，该模块是从vue中抽离的，这意味着：** 项目当中vue和vue-template-compiler的版本必须一致 **