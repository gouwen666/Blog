# Promise学习之从零实现Promise

## 了解需求

在开发之前，我们先了解一下需求：[Promise/A+规范](https://segmentfault.com/a/1190000002452115)。

## 撸起袖子

### 基础实现

先写个轮廓：

```js
    class Promise() {
        constuctor(fn) {}
        
        _resolve() {}

        _reject() {}

        then() {}

        catch() {}

        finally() {}

        static resolve() {}

        static reject() {}
    }
```

Promise存在3种状态，分别是`pending`、`fullfilled`、`rejected`；当状态发生变更时，都会保存相应的结果：

```js
    const PENDING = 'pending'
    const REJECTED = 'rejected'
    const FULFILLED = 'fulfilled'

    class Promise() {
        constuctor(fn) {
            this._status = PENDING;
            this._value = undefined;
            try {
                fn(this._resolve, this._reject);
            }catch(e) {
                this._reject();
            }
        }
        
        _resolve() {
            this._status = FULFILLED;
            this._value = value;
        }

        _reject() {
            this._status = REJECTED;
            this._value = reason;
        }
    }
```

### 实现then






