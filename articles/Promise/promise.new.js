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
}