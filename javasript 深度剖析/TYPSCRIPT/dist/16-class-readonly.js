"use strict";
// 类的访问修饰符
Object.defineProperty(exports, "__esModule", { value: true });
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
        this.gender = true;
    }
    sayHi(msg) {
        console.log(`I am ${this.name}, ${msg}`);
        console.log(this.age);
    }
}
const tom = new Person('tom', 18);
console.log(tom.name);
//# sourceMappingURL=16-class-readonly.js.map