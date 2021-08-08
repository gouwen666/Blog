# Promise学习之从零实现Promise

## 了解需求

在开发之前，我们先了解一下需求：[Promise/A+规范](https://promisesaplus.com/#notes)。

清楚需求之后，我们便可以开发了。

## 撸起袖子

### 实现轮廓

按照Promise的静态方法和实例方法，我们先画一个清晰的轮廓：

```js
    class Promise {
        //构造方法
        constuctor(fn) {}
        
        //函数参数接收的resolve方法
        _resolve() {}

        //函数参数接收的reject方法
        _reject() {}

        then() {}

        catch() {}

        finally() {}

        static resolve() {}

        static reject() {}
    }
```

### Promise存在3种状态，分别是`pending`、`fullfilled`、`rejected`

于是我们定义常量：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        ...
    }
```

** resolve方法能够将状态由pending转为fulfilled，这个 `转换` 是 `异步` 的；并且它能够 `拆解` promise对象，这个拆解过程也是异步的。 **

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        ...
        _resolve(value) {
            if (value instanceof Promise) {
                value.then(val => {
                    this._resolve(val);
                });
            }else {
                setTimeout(() => {
                    this._status = FULFILLED;
                    this._value = value;
                });
            }
        }
    }
```

** catch方法能够将pending转为rejected，这个 `转换` 为 `异步` 的。 **

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        ...
        _reject(reason) {
            setTimeout(() => {
                this._status = REJECTED;
                this._reason = reason;
            })
        }
    }
```

### 实现then方法

先分析要点：

+ 当状态为pending时，then的onFulfilled函数和onRejected函数会被收集；
+ 当状态为fulfilled时，收集到的所有onFulfilled函数会被调用；
+ 当状态为rejected时，收集到的所有onRejected函数会被调用；

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'

    class Promise {
        constructor() {
            ...
            this.onFulfilledList = [];
            this.onRejectedList = [];
            ...
        }

        then(onFulfilled, onRejected) {
            if(this._status === PENDING) {
                onFulfilled && this.onFulfilledList.push(onFulfilled);
                onRejected && this.onRejectedList.push(onRejected);
            }else if(this._status === FULFILLED) {
                onFulfilled && onFulfilled(this._value);
            }else if(this._status === REJECTED) {
                onRejected && onRejected(this._reason);
            }
        }
    }
```

### 实现catch

和then的思路一样，我们继续实现catch：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'

    class Promise {
        constructor() {
            ...
            this.onRejectedList = [];
            ...
        }

        catch(onRejected) {
            if(this._status === PENDING) {
                onRejected && onRejected(this._reason);
            }else if(this._status === REJECTED) {
                onRejected && onRejected(this._reason);
            }
        }
    }
```





