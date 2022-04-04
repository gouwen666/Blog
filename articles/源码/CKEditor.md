# CKEditor

记录关键的学习点：

1、根据代码的注释生成文档:

 - 注释规范
   	- 属性：默认值、数据类型、是否只读、代码示例、描述信息。通过 #prop 识别
      	- 方法：参数、返回值（默认值、数据类型）、代码示例、描述信息。通过 @param 识别
   	- 事件：

2、core：

+ Command：命令的基类
+ Context：？？
+ Config：富文本的所有配置将会在这里进行保存
+ Model: ?? 

3、this.t  处理多语。暴露出去，可以处理多语言

4、editor.ui  负责渲染。ui层统一具有哪些参数？

5、document**.**createElementNS  是用来创建svg中的元素

6、*observablemixin* 观察者api ？？？

7、为什么某些方法要 decorate

8、事件触发是比钩子、override影响最小的代码  参考 ViewCollection和Collection的处理

### 

## ui

### view.js

所有ui组件的基类。

### template.js

渲染dom的类。输入ckeditor定义好的数据结构，输出真实DOM对象。



## util

### observablemixin.js

属性观察和数据绑定的接口







### dropdown

### button

#### buttonview



#### switchbuttonview



