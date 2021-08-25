# vue实践之优化

## 懒加载

1. 路由懒加载
2. 组件懒加载
3. 图片懒加载

### 路由懒加载

```js
new VueRouter({
    routes: [{
        path: '/home',
        component: () => import('./Home.vue')
    }]
})
```

### 组件懒加载

```js
new Vue({
    component: {
        'Test': () => import('./Test')
    },
    render: function(h) {
        return h('Test');
    }
})
```

### 图片懒加载

只加载可是区域的图片，减少资源占用。

推荐使用[vue-lazyload](https://github.com/hilongjw/vue-lazyload)

## 按需加载

编译构建时，只编译构建所需要的模块，减少最终代码的体积。

如果ui库是 `element-ui` ，我们需要同步使用babel插件：`babel-plugin-component`，这样才能按需打包构建。

[项目优化之按需加载]()

## 缓存

### keep-alive缓存组件

组件的缓存，能够减少组件重复渲染，从而提升性能。

```vue
    <keep-alive>
        <component :is="view"></component>
    </keep-alive>
```

### 缓存数据

vue对于data或计算属性会设置getter，这意味着每访问一次，就会执行一次getter。所以，尽可能少地访问，就能减少getter的执行，从而提升性能。

**bad**

```vue
    <script>
        export default {
            data() {
                return {
                    name: 'test',
                    age: 28,
                    text: 'its ok'
                }
            },
            computed: {
                cInfo() {
                    return this.name + ' is ' + this.age;
                },
                cList() {
                    let ret = [];
                    for(var i = 0; i < 10; i++>) {
                        list.push(this.cInfo + ' : ' + this.text);
                    }
                    return ret;
                }
            }
        }
    </script>
```

**good**

```vue
    <script>
        export default {
            data() {
                return {
                    name: 'test',
                    age: 28,
                    text: 'its ok'
                }
            },
            computed: {
                cInfo() {
                    return this.name + ' is ' + this.age;
                },
                cList() {
                    let ret = [];
                    const text = this.text;
                    const cInfo = this.cInfo;
                    for(var i = 0; i < 10; i++>) {
                        list.push(cInfo + ' : ' + text);
                    }
                    return ret;
                }
            }
        }
    </script>
```

## 拆分子组件

从这篇 [vue2.0原理之diff算法](https://raw.githubusercontent.com/gouwen666/Blog/master/articles/框架之vue/vue2.0原理之自实现虚拟dom.md) 我们可以了解到 `组件维护着自己的虚拟DOM树`，这意味着，子组件的拆分，可以减少组件渲染的逻辑（diff次数、dom比较等等），从而提升性能。

**bad**

```vue
    <template>
        <div>
            父组件
            <div>
                子组件
            </div>
        </div>
    </template>
    <script>
        export default {

        }
    </script>
```

**good**

```vue
    <template>
        <div>
            父组件
            <Child></Child>
        </div>
    </template>
    <script>
        export default {
            components: {
                Child: {
                    render: h => h('div', '子组件')
                }
            }
        }
    </script>
```

## 函数式组件

有状态的组件意味着底层会有更多维护状态的数据和逻辑存在，函数式组件作为无状态的组件，能够减少相关数据和逻辑，从而提高了组件的性能。

**bad**

```vue
    <template>
        <component :is="this.type"></component>
    </template>
    <script>
        export default {
            props: {
                type: String
            }
        }
    </script>
```

**good**

```vue
    <template functional>
        <component :is="props.type"></component>
    </template>
    <script>
        export default {
            props: {
                type: String
            }
        }
    </script>
```

## 大数据处理

+ 使用虚拟滚动，只渲染少部分区域的内容。
+ data中的数据只保留渲染依赖的数据，减少多余的数据响应。

### 虚拟滚动

推荐使用[vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)、[vue-virtual-scroll-list](https://github.com/tangbc/vue-virtual-scroll-list);

### 减少数据过度的响应式处理

我们需要根据实际的应用场景来判断数据是否会发生改变，从而决定使用哪种方式：

    + 数据不会改变，冻结数据
    + 数据经常变动，保留数据

#### 冻结数据

**bad**

```vue
    <template>
        <ul>
            <li v-for="item in list">{{item.name}}</li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: [
                        ...
                    ]
                }
            }
        }
    </script>
```

**good**

```vue
    <template>
        <ul>
            <li v-for="item in list">{{item.name}}</li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: Object.freeze([
                        ...
                    ])
                }
            }
        }
    </script>
```

#### 保留关键属性

**bad**

```vue
    <template>
        <ul>
            <li v-for="item in list">{{item.name}}</li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: []
                }
            },
            created() {
                const data = [{
                    name: 'test1',
                    age: 28,
                    ...
                },{
                    name: 'test1',
                    age: 28,
                    ...
                }];
                this.list = data;
            }
        }
    </script>
```

**good**

```vue
    <template>
        <ul>
            <li v-for="item in list">{{item.name}}</li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: []
                }
            },
            created() {
                const data = [{
                    name: 'test1',
                    age: 28,
                    ...
                },{
                    name: 'test1',
                    age: 28,
                    ...
                }];
                this.list = data.map(item => {
                    return {
                        name: item.name
                    }
                })
            }
        }
    </script>
```









