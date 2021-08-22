# js基础之getBoundingClientRect

返回元素的大小及其相对于视口的位置。

视口就是浏览器窗口。

## 语法

```js
    let domRect = element.getBoundingClientRect();
```

## 盲区

对 `domRect.top` 存在误解。不管是否存在滚动区域，top始终是元素距离窗口顶部的距离，left亦如此。

### 示例

不存在滚动区域：

```html
    <div>
        <div style="width:100%;height:400px;"></div>
        <div class="dom" style="width:100%;height:300px;"></div>
    </div>
```
```js
    let dom = document.querySelector('dom');
    let domRect = dom.getBoundingClientRect();
    console.log(domRect);
    // {
    //     bottom: 700,
    //     height: 300,
    //     left: 0,
    //     right: 375,
    //     top: 400,
    //     width: 375,
    //     x: 0,
    //     y: 400
    // }
```

存在滚动区域：

```html
    <div style="height: 300px;overflow-y:scroll;margin-top:200px;">
        <div style="width:100%;height:400px;"></div>
        <div class="dom" style="width:100%;height:300px;"></div>
    </div>
```
```js
    let dom = document.querySelector('dom');
    let domRect = dom.getBoundingClientRect();
    console.log(domRect);
    // {
    //     bottom: 900,
    //     height: 300,
    //     left: 0,
    //     right: 375,
    //     top: 600,
    //     width: 375,
    //     x: 0,
    //     y: 600
    // }
```
随着区域滚动，距离窗口上边和左边的距离也在发生改变。