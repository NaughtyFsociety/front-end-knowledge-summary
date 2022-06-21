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
class Student extends Person {
    // constructor(name: string, age: number) {
    //     super(name, age)
    //     console.log(this.gender)
    // }
    constructor(name, age) {
        super(name, age);
        console.log(this.gender);
    }
    static create(name, age) {
        return new Student(name, age);
    }
}
const tom = new Person('tom', 18);
// const jack = new Student('tom', 18)
const jack = Student.create('jack', 17);
console.log(tom.name);
//# sourceMappingURL=15-class.modifers.js.map