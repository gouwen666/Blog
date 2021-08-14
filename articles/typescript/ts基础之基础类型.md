# ts基础之基础类型

## 布尔值

```ts
let bol: boolean = false;
```

## 数字

```ts
let num: number = 12;
```

## 字符串

```ts
let str1: string = 'test';

let str2: string = `${str1}_test`;
```

## 数组

```ts
let numArr: number[] = [1, 2, 3];

let strArr: string[] = ['1', '2', '3'];
```

或者

```ts
let numArr: Array<number> = [1, 2, 3];

let strArr: Array<string> = ['1', '2', '3'];
```

## 元组

？？？理解不深

## 枚举

```ts
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```

手动指定编号：

```ts
enum Color {Red=1, Green, Blue}
let c: Color = Color.Green;
```

### 注意

默认情况下，编号从 0 开始，未手动指定的编号为前一个编号加1。

示例1：

```ts
enum Color {Red=2, Green, Blue}
```

说明：Green未指定编号，则编号为前一个编号加1，也就是 `1(Red) + 1`，所以Green的编号为 `2`；同理，推算出Blue的编号为 `2(Green) + 1`，所以Blue的编号为 `3`。

示例2:

```ts
enum Color {Red=2, Green=1, Blue}
```

说明：Blue未指定编号，则编号为前一个编号加1，也就是 `1(Green) + 1`，所以Blue的编号为2，和 Red 相同。

总结：这里有一个小坑，我们在定义枚举的时候，养成习惯，从小到大排列及声明，避免造成枚举值重复。

## Any

> 声明任何类型的数据

```ts
let temp: any;
temp = 1;
temp = 'test';
temp = false;

let tempArr: any[] = [1, 'test', true];
```

## Void

> 声明没有任何类型

```ts
function (): void {
    console.log('test');
}
```

### 注意

void类型的变量可以赋值为undefined和null。

```ts
let unf: void = undefined;
let nul: void = null;
```

## Null 和 Undefined

```
let unf: undefined = undefined;
let nul: null = null;
```

### 注意

默认情况下，`null` 和 `undefined` 是所有类型的子类型，这意味着`null` 和 `undefined`可以赋值给任何类型。

```ts
let num: number = undefined;

let str: string = null;
```

开启 `--strictNullChecks` 之后，上述的操作会被认为是不合法的。

## Never

？？？理解不深

## Object

```ts
let obj: object = {};
```

## 类型断言

？？？理解不深
