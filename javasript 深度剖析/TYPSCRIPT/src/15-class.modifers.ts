// 类的访问修饰符

export { }  // 确保跟其他示例没有成员冲突

class Person {
    public name: string  // = 'init name'
    private age: number
    protected gender: boolean

    constructor(name: string, age: number) {
        this.name = name
        this.age = age
        this.gender = true
    }

    sayHi(msg: string): void {
        console.log(`I am ${this.name}, ${msg}`)
        console.log(this.age)
    }
}

class Student extends Person {
    // constructor(name: string, age: number) {
    //     super(name, age)
    //     console.log(this.gender)
    // }

    private constructor(name: string, age: number) {
        super(name, age)
        console.log(this.gender)
    }

    static create(name: string, age: number) {
        return new Student(name, age)
    }
}

const tom = new Person('tom', 18)
// const jack = new Student('tom', 18)

const jack = Student.create('jack', 17)

console.log(tom.name)