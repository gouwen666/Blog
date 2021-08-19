# js基础之继承

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

**缺点**

1. 不能向父构造函数传入参数

```js
...
function Child() {
    this.age = 28;
}
Child.prototype = new Parent();
...
```
原型继承是放生在构造函数之外，无法传入参数。

2. 污染原型对象的引用类型

```js
function Parent() {
    this.obj = {
        name: 'test'
    }
}
function Child() {}
Child.prototype = new Parent();

let child1 = new Child();
let child2 = new Child();

child1.obj.name = 'child1';
console.log(child2.obj.name); // child1
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

**缺点**

原型方法只能在子构造函数上定义，无法复用父构造函数上的原型方法。

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

融合了原型链继承和借用构造函数继承的优点，既可以给父构造函数传递参数，又可以复用副构造函数上的原型方法。

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

**缺点**

1. 和原型链继承一样，会污染原型对象的引用类型。
2. 实例方法和实例属性的声明和赋值与其他逻辑混在一起，逻辑混乱，阅读性差。

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

从对象角度出发，去实现继承，而非构造函数的方式。

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

