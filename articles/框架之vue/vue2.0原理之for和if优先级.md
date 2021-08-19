# vue2.0原理之for和if优先级

## 问题描述

以下渲染先执行v-for还是先执行v-if？

通常v-if存在两种场景存在两种情况：
+ 一个变量控制v-if
+ 遍历的每一项的属性控制v-if

一个变量控制v-if：
```vue
    <template>
        <ul>
            <li v-for="item in list" v-if="show"></li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: [{
                        value: '',
                        isShow: false
                    },{
                        value: '',
                        isShow: true
                    }],
                    show: false
                }
            }
        }
    </script>
```

遍历的每一项的属性控制v-if：
```vue
    <template>
        <ul>
            <li v-for="item in list" v-if="item.isShow"></li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: [{
                        value: '',
                        isShow: false
                    },{
                        value: '',
                        isShow: true
                    }],
                    show: false
                }
            }
        }
    </script>
```

通过查看编译之后的render函数，我们可以发现：

`v-for` 先于 `v-if` 执行。

## 结论

1. v-for优先于v-if解析（优先的原因）

```js
    // vue源码
    ...
    function genElement (el, state) {
        ...
        }else if (el.for && !el.forProcessed) {
            return genFor(el, state)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
        ...
    }
    ...
```

2. 如果同时出现，每次条件改变后都会先执行循环再进行条件判断。执行了多余的循环，导致性能浪费。所以存在以下优化行为：

情形一：一个变量控制v-if：

```vue
    <template>
        <ul v-if="show">
            <li v-for="item in list"></li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: [{
                        value: '',
                        isShow: false
                    },{
                        value: '',
                        isShow: true
                    }],
                    show: false
                }
            }
        }
    </script>
```

说明：减少进入循环的次数，从而提升性能。

情形二：遍历的每一项的属性控制v-if

```
    <template>
        <ul>
            <li v-for="item in cList"></li>
        </ul>
    </template>
    <script>
        export default {
            data() {
                return {
                    list: [{
                        value: '',
                        isShow: false
                    },{
                        value: '',
                        isShow: true
                    }]
                }
            },
            computed: {
                cList() {
                    return this.list.filter(item => item.isShow)
                }
            }
        }
    </script>
```

说明：通过计算属性，减少循环遍历的总次数，从而提升性能。

3. 如果希望先执行v-if，则使用template嵌套循环

参考第二条结论中情形一的示例。