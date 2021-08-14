# ts基础之联合类型

## 定义

当变量存在多种类型的时候，我们使用联合类型来定义。

举例：

```ts
let numOrStr: string | number;
numOrStr = 7;
numOrStr = 'test';

numOrStr = true; // error
```

## 注意

当访问联合类型的属性或者方法时，如果该变量类型已经确定，则访问其属性或者方法；如果变量类型不确定，则访问共有的类型或者方法。

**类型确定**

```ts
let numOrStr: string | number;

numOrStr = 'test';
console.log(numOrStr.length); // 4

numOrStr = 1;
console.log(numOrStr.length); // error
```

总结：联合类型一旦赋值，其类型是确定的。访问属性或者方法时会根据其数据类型进行校验。

**类型不确定**

```ts
function getLength(value: string | number) {
    return value.length;
}

// error
```

总结：参数作为联合类型，其类型是不确定的。所以校验时会判断其属性或者方法联合类型是否都具备，如果都具备，则校验通过；否则，校验失败。