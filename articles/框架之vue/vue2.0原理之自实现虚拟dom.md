# vue2.0原理之自实现虚拟dom

## 从0实现

先设计虚拟dom的数据结构：

```js
    let vnode = {
        tagName: '',
        props: {
            id: '',
            class: ''
        },
        children: [
            vnode,
            vnode,
            ...
        ],
        text: ''
    }
```

例如如下dom树：

```html
    <ul class="list">
        <li class="item">1</li>
        <li class="item">2</li>
        <li class="item" style="background:red;">3</li>
    </ul>
```
则vnode的结构如下所示：

```js
    let vnode = {
        tagName: 'ul',
        props: {
            class: 'list'
        },
        children: [
            {
                tagName: 'li',
                props: {
                    class: 'item'
                },
                children: [
                    {
                        tagName: '',
                        props: {},
                        children: [],
                        text: 1
                    }
                ]
            },
            {
                tagName: 'li',
                props: {
                    class: 'item',
                    style: 'background:red;'
                },
                children: [
                    {
                        tagName: '',
                        props: {},
                        children: [],
                        text: 2
                    }
                ]
            },
            {
                tagName: 'li',
                props: {
                    class: 'item'
                },
                children: [
                    {
                        tagName: '',
                        props: {},
                        children: [],
                        text: 3
                    }
                ]
            }
        ]
    }
```

实现渲染：

使用DFS来遍历虚拟dom树，将每一个虚拟dom渲染成真实的dom。

```js
function render(vnode) {
    let dom;
    if(vnode.tagName) {
        dom = document.createElement(vnode.tagName);
        for(propName in dom.props){
            propValue = dom.props[propName];
            dom.setAttribute(propName, propValue);
        }
        dom.children.forEach(vnode => {
            dom.appendChild(render(vnode));
        })
    }else {
        dom = document.createTextNode(vnode.text);
    }
    return dom;
}

document.body.appendChild(render(vnode))
```