# vue2.0原理之自实现双向绑定

## 业界双向绑定思路

+ 基于发布订阅模式 - KnockoutJs
+ 基于数据模型 - EmberJs
+ 基于脏检查 - AngularJs
+ 基于数据劫持 - VueJs


## 设计思路

+ Updater：管理dom更新，一对一
+ Watcher：管理Updater，一对一
+ Dep：管理Watcher，一对多
+ Observer：管理Dep，一对一

## 从0实现

```js
    class CusVue {
        
        constructor(options) {
            this.$options = options;
            this.$data = options.data;
            this.initProxy(this.$data);
            this.observe(this.$data);
        }
    
        //拦截数据
        observe(data) {
            if (!data || typeof data !== 'object') {
                return;  
            }
                Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key]);
            })
        }
    
        //定义响应
        defineReactive(data, key, value) {
            var self = this;
            var dep = new Dep();
            self.observe(value);
                Object.defineProperty(data, key, {
                get: function() {
                    Dep.target && (dep.addDep(Dep.target));
                        return value;
                },
                set: function(newVal) {
                    if (newVal !== value) {
                        return;
                    }
                    value = newVal;
                    self.observe(value);
                                    dep.notify();
                }
            });
        }
    
        initProxy(data) {
                Object.keys(data).forEach(key => {
                this.proxyData(key);
            })
        }
    
        //代理数据
        proxyData(key) {
                Object.defineProperty(this, key, {
                    get() {
                        return this.$data[key];
                },
                set(value) {
                        this.$data[key] = value;
                }
            })
        }
    }
    class Dep {
        constructor() {
                this.list = [];
        }
            addDep(watcher) {
                this.list.push(watcher);
        }
        notify() {
                this.list.forEach(watcher => {
                    watcher.update();
            })
        }
    }
    class Watcher {
            constructor(vm, key, handle) {
            this.vm = vm;
            this.key = key;
            this.handle = handle;
                Dep.target = this;
            vm[key];
            Dep.target = null;
        }
        update() {
                this.handle.apply(this.vm, [this.vm[this.key]]);
        }
    }
```

**缺点：**

无法拦截数组的变更

```js
    const vm = new CusVue({
            data: {
                arr: [1,2,3]
        }
    })

    vm[2] = 4; //不会触发Dep的通知
```
**基于数组的优化：**

```js
    class CusVue {
            ...
        //拦截数组，修改数组的7个造作数组的api
        defineArrayReactive(data, dep) {
            var newArrProto = new Array();
                newArrProto.push = function() {
                [].push.apply(data, arguments);
                    dep.notify();
            }
            newArrProto.pop = function() {
                    [].push.apply(data, arguments);
                    dep.notify();
            }
            // ...省略其他数组方法
            data.__proto__ = newArrProto;
        }
            //定义响应
        defineReactive(data, key, value) {
            var self = this;
            var dep = new Dep();
            if (Array.isArray(value)) {
                    self.defineArrayReactive(value, dep);
            }
            self.observe(value, dep);
                Object.defineProperty(data, key, {
                get: function() {
                    Dep.target && (dep.addDep(Dep.target));
                        return value;
                },
                set: function(newVal) {
                    if (newVal !== value) {
                        return;
                    }
                    value = newVal;
                    if (Array.isArray(value)) {
                        self.defineArrayReactive(value, dep);
                    }
                    self.observe(value, dep);
                                    dep.notify();
                }
            });
        }
        ...
    }
```