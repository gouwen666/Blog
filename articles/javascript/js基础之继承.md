# js深入之继承

+ 原型链继承
+ 借用构造函数继承
+ 组合继承
+ 原型式继承
+ 寄生式继承
+ 寄生组合式继承

## 原型链继承

```js
function Parent() {
    this.name = 'test';
}
Parent.prototype.getName() {
    return this.name;
}
function Child() {
    this.age = 28;
}
Child.prototype = new Parent();
Child.prototype.getAge = function() {
    return this.age;
}

let child = new Child();
child.getName(); // test
child.getAge(); // 28
```

## 借用构造函数继承

```js
function Parent(name) {
    this.name = name;
}
function Child() {
    Parent.call(this, 'test');
    this.age = 28; 
}
Child.prototype.getName() {
    return this.name;
}
Child.prototype.getAge() {
    return this.age;
}
let child = new Child();
child.getName() // test
child.getAge() // 28
```

## 组合继承

组合继承 = 原型链继承 + 借用构造函数继承

```js
function Parent(name) {
    this.name = name;
}
Parent.prototype.getName = function() {
    return this.name;
}
function Child() {
    Parent.call(this, 'test');
    this.age = 28;
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;
Child.prototype.getAge() {
    return this.age;
}

var child = new Child();
child.getName(); // 'test'
child.getAge(); // 28
```

## 原型式继承

该继承方式同 Object.create() 相同，这是在已知原型对象前提下从而实现继承的方式。

```js
function object(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
}

let origin = {
    name: 'test',
    getName() {
        return this.name;
    }
};
let obj = object(origin);
obj.getName(); // test
obj.age = 28;
obj.getAge = function() {
    return this.age;
}
obj.getAge(); // 28
```

## 寄生式继承

寄生式继承 = 原型式继承 + 工厂模式

```js
function object(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
}
function createObject(obj) {
    let clone = object(obj);
    clone.age = 28;
    clone.getAge = function() {
        return this.age;
    }
    return clone;
}

let origin = {
    name: 'test',
    getName() {
        return this.name;
    }
};
let instance = createObject(origin);
clone.getName(); // test
clone.getAge(); // 28
```

## 寄生组合式继承

寄生组合式继承 = 寄生式继承 + 组合继承

```js
function object(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
}
function inheritPrototype(Child, Parent) {
    var proto = object(Parent.prototype);
    proto.constructor = Child;
    Child.prototype = proto;
}
function Parent(name) {
    this.name = name;
}
Parent.prototype.getName = function() {
    return this.name;
}
function Child() {
    Parent.call(this, 'test');
    this.age = 28;
}
inheritPrototype(Child, Parent);
Child.prototype.getAge = function() {
    return this.age;
}

let child = new Child();
child.getAge(); // 28
child.getName(); // test
```