# ts基础之类型推论

## 定义

在没有定义类型的时候，类型推论能够帮助提供类型。

只有在变量声明进行赋值时，才会发生类型推断。

## 推断规则

1. 如果常量确定，则类型为常量的数据类型

```ts
let num = 1;
num = 'test'; // error

let bol = true;
bol = 1; // error
```

```ts
let obj = {
    num: 1,
    str: 'test'
}
obj.num = 2;
obj.num = 'test'; // error
```

2. 如果常量多样，则类型为兼容所有候选类型的类型

```ts
let arr = [1, true];

arr[0] = false;
arr[0] = 'test'; // error
```

说明：数组的项存在两种类型：number 或者 boolean，所以数组的类型为联合类型 `number | boolean`。

3. 上下文类型

？？？没有理解