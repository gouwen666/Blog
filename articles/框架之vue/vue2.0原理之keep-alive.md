# vue2.0原理之KeepAlive组件

## 前言

KeepAlive组件是优化vue项目时最常用的手段之一，它是个功能型组件，主要用于保留组件状态或避免重新渲染。



## 使用

```vue
<template>
		<keep-alive>
  			<comp-a v-if="a > 1"></comp-a>
  			<comp-b v-else></comp-b>
  	</keep-alive>
</template>
```



注意：keep-alive只能缓存一个子组件，其余子组件将会被忽略，例如：

```vue
<template>
		<keep-alive>
  			<comp-a></comp-a>
  			<comp-b></comp-b>
  	</keep-alive>
</template>
```

`comp-b` 将不会被渲染出来。



## 原理

```javascript
var KeepAlive = {
  	...
		created: function created () {
      	this.cache = Object.create(null);
      	this.keys = [];
    },
  	...
}
```

**说明：**

`cache` 缓存的是vnode，组件实例会从 `vnode.componentInstance` 获取。

`keys` 存储被缓存组件的唯一标识-key，最大数量判断以及优先淘汰哪个组件需要依赖这个值。



```javascript
var KeepAlive = {
		...
  	render: function render () {
      	var slot = this.$slots.default;
      	var vnode = getFirstComponentChild(slot);
      	var componentOptions = vnode && vnode.componentOptions;
      	if (componentOptions) {
        		// 获取组件的名称
        		var name = getComponentName(componentOptions);
            ...
            // 如果不需要缓存
            if (
              (include && (!name || !matches(include, name))) ||
              (exclude && name && matches(exclude, name))
            ) {
            		return vnode
            }
            ...
            // 获取组件key
            var key = vnode.key == null
                ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                : vnode.key;
            if (cache[key]) {
              	vnode.componentInstance = cache[key].componentInstance;
              	remove(keys, key);
              	keys.push(key);
            } else {
                cache[key] = vnode;
                keys.push(key);
                // prune oldest entry
                if (this.max && keys.length > parseInt(this.max)) {
                  	pruneCacheEntry(cache, keys[0], keys, this._vnode);
                }
            }

        		vnode.data.keepAlive = true;
      	}
      	return vnode || (slot && slot[0])
    }
  	...
}
```

**说明：**

如果 `cache[key]` 存在，则将缓存实例赋值给当前vnode的componentInstance，同时更新 `cache`、`keys` ；如果不存在，则进行缓存。



## 延展

如果要缓存多个组件呢？

**分析：**

从keep-alive组件不难看出，即使有多个子组件，渲染函数也只能返回一个vnode，所以我们需要创造一个组件（或者vnode）来合并所有的子组件，如下：

```javascript
...
cache[key] = h({
  	render(_h) {
    return _h('div', slot)
  }
}, {
  	keepAlive: true
});
...
keys.push(key);
return cache[key];
...
```

最终实现组件实现如下，我们将这个组件命名为 `KeepMultiAlive`:

```vue
<script>
const patternTypes = [String, RegExp, Array];

function isRegExp (v) {
	return Object.prototype.toString.call(v) === '[object RegExp]'
}

function isDef (v) {
	return v !== undefined && v !== null
}

function isAsyncPlaceholder (node) {
	return node.isComment && node.asyncFactory
}

function getComponentName(opts) {
    //获取组件名
    return opts && (opts.Ctor.options.name || opts.tag);
}

function getVnodeComponentName(vnode) {
    const componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
        return getComponentName(componentOptions) || '';
    }
    return '';
}

function getVnodeComponentKey(vnode) {
    const componentOptions = vnode && vnode.componentOptions;
    return vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
}

function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

function matches (pattern, name) { //匹配组件
	if (Array.isArray(pattern)) {
		return pattern.indexOf(name) > -1
	} else if (typeof pattern === 'string') {
		return pattern.split(',').indexOf(name) > -1
	} else if (isRegExp(pattern)) {
		return pattern.test(name)
	}
	/* istanbul ignore next */
	return false
}

function pruneCache(keepAliveInstance, filter) {
    const { cache, keys, _vnode } = keepAliveInstance;
    for (const key in cache) {
        const cachedNode = cache[key];
        if (cachedNode) {
            const name = getComponentName(cachedNode.componentOptions);
            if (name && !filter(name)) {
                pruneCacheEntry(cache, key, keys, _vnode);
            }
        }
    }
}

function pruneCacheEntry(cache = {}, key, keys = [], current) {
    const cached = cache[key];
    if (cached && (!current || cached.tag !== current.tag)) {
        cached.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
}

export default {
    
    name: "KeepMultiAlive",

    props: {
        include: patternTypes,
        exclude: patternTypes,
        max: [String, Number]
    },

    created() {
        this.cache = Object.create(null); //缓存vnode
        this.keys = []; // 组件缓存活跃度维护
        this.mergeCache = {}; //缓存合并的vnode
    },

    mounted() {
        this.$watch("include", val => {
            pruneCache(this, name => matches(val, name));
        });
        this.$watch("exclude", val => {});
    },

    destroyed() {
        for (const key in this.cache) {
			pruneCacheEntry(this.cache, key, this.keys)
		}
    },

    render(h) {
        const slot = this.$slots.default;
        const {
            isKeepAlive
        } = this;
        let isUseCacheComp = false;
        let nameArr = [];
        let keyArr = [];
        if (!slot) {
            return;
        }
        slot.forEach(vnode => {
            isUseCacheComp =  isUseCacheComp || isKeepAlive(vnode);
            nameArr.push(getVnodeComponentName(vnode));
            keyArr.push(getVnodeComponentKey(vnode));
        });
        if (isUseCacheComp) {
            const {
                cache,
                keys
            } = this;
            const key = keyArr.join('|');
            if (cache[key]) {
                remove(keys, key);
                keys.push(key);
            }else {
                cache[key] = h({
                    render(_h) {
                        return _h('div', slot)
                    }
                }, {
                    keepAlive: true
                });
                keys.push(key);
                if (this.max && keys.length > parseInt(this.max)) {
                    pruneCacheEntry(cache, keys[0], keys, this._vnode);
                }
            }
            return cache[key];
        }else {
            return h('div', slot);
        }
    },

    methods: {
        isKeepAlive(vnode) {
            const {
                include,
                exclude
            } = this;
            const name = getVnodeComponentName(vnode);
            if (
                (include && (!name || !matches(include, name))) ||
                (exclude && name && matches(exclude, name))
            ) {
                return false
            }
            return true;
        }
    }
};
</script>

```



