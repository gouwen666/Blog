# 前端组件之WebComponent

## 创建WebComponent

### 1、定义元素

```javascript
customElement.define('my-example', MyExample);
```

### 2、创建组件类

```javascript
class MyExample extends HTMLElement {
  constructor() {
  	super();
    ...
  }
}
customElement.define('my-example', MyExample);
```

**说明：**

类需要继承 HTML 元素（内建元素或者非内建元素）

### 3、实现组件细节

```javascript
class MyExample extends HTMLElement {
  constructor() {
  	super();
    var shadow = this.attachShadow({
      mode: 'open'
    });
    
    var text = this.getAttribute('text');
    var dom = document.createElement('div');
    dom.setAttribute('class', 'wrapper');
    dom.textContent = text;
    
    var style = document.createElement('style');
    style.textContent = '.wrapper {color: red;}'
    
    shadow.appendChild(style);
    shadow.appendChild(dom);
  }
}
customElement.define('my-example', MyExample);
```

### 4、使用

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <my-example text="hello world"></my-example>
</body>
<script>
    class MyExample extends HTMLElement {
        constructor() {
            super();
            var shadow = this.attachShadow({
            mode: 'open'
            });
            
            var text = this.getAttribute('text');
            var dom = document.createElement('div');
            dom.setAttribute('class', 'wrapper');
            dom.textContent = text;
            
            var style = document.createElement('style');
            style.textContent = '.wrapper {color: red;}'
            
            shadow.appendChild(style);
            shadow.appendChild(dom);
        }
    }
    customElements.define('my-example', MyExample);
</script>
</html>
```

**注意：**

组件中声明的样式，不管是类型的选择器，都只影响组件内的元素，不会影响组件外的元素；同样，组件外声明的样式也不会影响组件内的元素。
