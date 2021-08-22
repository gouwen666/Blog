# js基础之parseInt

parseInt函数可解析一个字符串，并返回一个整数。

## 语法

```js
    let number = parseInt(string, radix)
```

## 示例

parseInt还能将其他进制转换成十进制的数字。

```js
    parseInt('11'); // 11
    parseInt('11', 2); // 3
    parseInt('11', 16); // 17

    parseInt('11', 1); // NaN
```

## 盲区

不清楚该函数还存在着第二个参数，以及它所代表的含义。

## 面试题

以下题目结果是什么？

```js
    ['1', '2', '3'].map(parseInt)
```

因为parseInt接受两个参数，所以上述问题可以转变成下列语句：

```js
    ['1', '2', '3'].map((item, index) => {
        return parseInt(item, index);
    })
```

所以最终结果是：

```js
    [1, NaN, NaN]
```
