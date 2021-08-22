# js实现之Promise

## 了解需求

在开发之前，我们先了解一下需求：[Promise/A+规范](https://promisesaplus.com/#notes)。

清楚需求之后，我们便可以开发了。

## 撸起袖子

### 实现轮廓

按照Promise的静态方法和实例方法，我们先画一个清晰的轮廓：

```js
    class Promise {
        //构造方法
        constructor() {}
        
        //函数参数接收的resolve方法
        _resolve() {}

        //函数参数接收的reject方法
        _reject() {}

        then() {}

        catch() {}

        static resolve() {}

        static reject() {}

        static all() {}
    }
```

### 实现构造函数

Promise存在3种状态，分别是`pending`、`fullfilled`、`rejected`，于是我们定义常量如下：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        ...
    }
```

resolve方法能够将状态由pending转为fulfilled，这个 `转换` 是 `异步` 的；并且它能够 `拆解` promise对象，这个过程也是异步的；状态变更之后，将收集到的所有方法处理掉。我们实现如下：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        constructor(executor) {
            ...
            this._status = PENDING;
            this._value = undefined;
            this.onFulfilledList = [];
            ...
            try{
                executor(this._resolve, this._reject);
            }catch(e) {
                this._reject(e);
            }
        }
        _resolve(value) {
            if (value instanceof Promise) {
                value.then(val => {
                    this._resolve(val);
                });
            }else {
                setTimeout(() => {
                    this._status = FULFILLED;
                    this._value = value;
                    this.onFulfilledList.forEach(fn => fn(this._value));
                    this.onFulfilledList = [];
                });
            }
        }
        ...
    }
```

catch方法能够将pending转为rejected，这个 `转换` 也是 `异步` 的；状态变更之后，将收集到的所有方法处理掉。实现如下：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'
    class Promise {
        constructor(executor) {
            ...
            this._status = PENDING;
            this._reason = undefined;
            this.onRejectedList = [];
            ...
            try{
                executor(this._resolve, this._reject);
            }catch(e) {
                this._reject(e);
            }
        }
        _reject(reason) {
            setTimeout(() => {
                this._status = REJECTED;
                this._reason = reason;
                this.onRejectedList.forEach(fn => fn(this._reason));
                this.onRejectedList = [];
            })
        }
    }
```

### 实现then方法

先分析一下要点：

+ 当状态为pending时，then的onFulfilled函数和onRejected函数会被收集；
+ 当状态为fulfilled时，收集到的所有onFulfilled函数会被调用；
+ 当状态为rejected时，收集到的所有onRejected函数会被调用；
+ 返回一个状态为fulfilled的promise对象，值为return出来的结果；

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
            return new Promise((resolve, reject) => {
                if(this._status === PENDING) {
                    onFulfilled && this.onFulfilledList.push((v) => {
                        try {
                            let val = onFulfilled(v);
                            resolve(val);
                        }catch(e) {
                            reject(e);
                        }
                    });
                    onRejected && this.onRejectedList.push((v) => {
                        try {
                            let val = onRejected(v);
                            resolve(val);
                        }catch(e) {
                            reject(e);
                        }
                    });
                }else if(this._status === FULFILLED) {
                    try {
                        onFulfilled && (let val = onFulfilled(this._value));
                        resolve(val);
                    }catch(e) {
                        reject(e);
                    }
                }else if(this._status === REJECTED) {
                    try {
                        onRejected && (let val = onRejected(this._reason));
                        resolve(val);
                    }catch(e) {
                        reject(e);
                    }
                }
            });
        }
    }
```

貌似重复逻辑有点多，我们优化一下：

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
            return new Promise((resolve, reject) => {
                if(this._status === PENDING) {
                    if(onFulfilled) {
                        this.onFulfilledList.push((val) => {
                            this._resolvePromise(val, onFulfilled, resolve, reject);
                        });
                    }
                    if(onRejected) {
                        this.onRejectedList.push((val) => {
                            this._resolvePromise(val, onRejected, resolve, reject);
                        });
                    }
                }else if(this._status === FULFILLED) {
                    if(onFulfilled) {
                        this._resolvePromise(this._value, onFulfilled, resolve, reject);
                    }
                }else if(this._status === REJECTED) {
                    if(onRejected) {
                        this._resolvePromise(this._reason, onRejected, resolve, reject);
                    }
                }
            });
        }

        _resolvePromise(val, callback, resolve, reject) {
            try {
                resolve(callback(val));
            }catch(e) {
                reject(e);
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
            return new Promise((resolve, reject) => {
                if(this._status === PENDING) {
                    if(onRejected) {
                        this.onRejectedList.push((val) => {
                            this._resolvePromise(val, onRejected, resolve, reject);
                        });
                    }
                }else if(this._status === REJECTED) {
                    if(onRejected) {
                        this._resolvePromise(this._reason, onRejected, resolve, reject);
                    }
                }
            })
        }

        _resolvePromise(val, callback, resolve, reject) {
            try {
                resolve(callback(val));
            }catch(e) {
                reject(e);
            }
        }
    }
```

### 实现静态方法resolve

分析特点：

+ 如果参数是promise，返回该promise
+ 如果参数不是promise，返回新的fulfilled状态的promise，值为该参数

```js
    class Promise {
        ...
        static resolve(value) {
            if(value instanceof Promise) {
                return value;
            }else {
                return new Promise(resolve => resolve(value))
            }
        }
    }
```

### 实现静态方法reject

不管参数是什么，都会返回一个新的rejected状态的promise

```js
    class Promise {
        ...
        static reject(reason) {
            return new Promise((resolve, reject) => reject(reason));
        }
    }
```

### 实现静态方法all

当所有的promise都成功，状态才会变成fulfilled；只要有一个报错，状态会立即变成rejected。

```js
    class Promise {
        ...
        static all(promises) {
            return new Promise((resolve, reject) => {
                let count = 0;
                let ret = [];
                promises.forEach((promise, index) => {
                    promise.then(res => {
                        ret[index] = res;
                        if(++count === promises.length) {
                            resolve(ret);
                        }
                    }, err => {
                        reject(err);
                    })
                });
            });
        }
    }
```

### 实现静态方法race

```js
    class Promise {
        ...
        static race(promises) {
            return new Promise((resolve, reject) => {
                promises.forEach((promise, index) => {
                    promise.then(res => {
                        resolve(res);
                    }, err => {
                        reject(err);
                    })
                });
            });
        }
    }
```

### 最后

到这里，我们已经实现了一个基本的Promise，整理一下代码，如下：

```js
const PENDING = 'pending';
const REJECTED = 'rejected';
const FULFILLED = 'fulfilled';
class Promise {
    //构造方法
    constructor(executor) {
        this._status = PENDING;
        this._value = undefined;
        this._reason = undefined;
        this.onFulfilledList = [];
        this.onRejectedList = [];
        try{
            executor(this._resolve.bind(this), this._reject.bind(this));
        }catch(e) {
            this._reject(e);
        }
    }
    
    //函数参数接收的resolve方法
    _resolve(value) {
        if (value instanceof Promise) {
            value.then(val => {
                this._resolve(val);
            });
        }else {
            setTimeout(() => {
                this._status = FULFILLED;
                this._value = value;
                this.onFulfilledList.forEach(fn => fn(this._value));
                this.onFulfilledList = [];
            });
        }
    }

    //函数参数接收的reject方法
    _reject(reason) {
        setTimeout(() => {
            this._status = REJECTED;
            this._reason = reason;
            this.onRejectedList.forEach(fn => fn(this._reason));
            this.onRejectedList = [];
        })
    }

    then(onFulfilled, onRejected) {
        return new Promise((resolve, reject) => {
            if(this._status === PENDING) {
                if(onFulfilled) {
                    this.onFulfilledList.push((val) => {
                        this._resolvePromise(val, onFulfilled, resolve, reject);
                    });
                }
                if(onRejected) {
                    this.onRejectedList.push((val) => {
                        this._resolvePromise(val, onRejected, resolve, reject);
                    });
                }
            }else if(this._status === FULFILLED) {
                if(onFulfilled) {
                    this._resolvePromise(this._value, onFulfilled, resolve, reject);
                }
            }else if(this._status === REJECTED) {
                if(onRejected) {
                    this._resolvePromise(this._reason, onRejected, resolve, reject);
                }
            }
        });
    }

    catch(onRejected) {
        return new Promise((resolve, reject) => {
            if(this._status === PENDING) {
                if(onRejected) {
                    this.onRejectedList.push((val) => {
                        this._resolvePromise(val, onRejected, resolve, reject);
                    });
                }
            }else if(this._status === REJECTED) {
                if(onRejected) {
                    this._resolvePromise(this._reason, onRejected, resolve, reject);
                }
            }
        })
    }

    _resolvePromise(val, callback, resolve, reject) {
        try {
            resolve(callback(val));
        }catch(e) {
            reject(e);
        }
    }

    static resolve(value) {
        if(value instanceof Promise) {
            return value;
        }else {
            return new Promise(resolve => resolve(value))
        }
    }

    static reject(reason) {
        return new Promise((resolve, reject) => reject(reason));
    }

    static all(promises) {
        return new Promise((resolve, reject) => {
            let count = 0;
            let ret = [];
            promises.forEach((promise, index) => {
                promise.then(res => {
                    ret[index] = res;
                    if(++count === promises.length) {
                        resolve(ret);
                    }
                }, err => {
                    reject(err);
                })
            });
        });
    }

    static race(promises) {
        return new Promise((resolve, reject) => {
            promises.forEach((promise, index) => {
                promise.then(res => {
                    resolve(res);
                }, err => {
                    reject(err);
                })
            });
        });
    }
}
```







