"use strict";
// 类(Class)
Object.defineProperty(exports, "__esModule", { value: true });
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    sayHi(msg) {
        console.log(`I am ${this.name}, ${msg}`);
    }
}
//# sourceMappingURL=14-class.basic.js.map