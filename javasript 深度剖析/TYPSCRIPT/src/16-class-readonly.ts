// 类的访问修饰符

export { }  // 确保跟其他示例没有成员冲突

class Person {
    public name: string  // = 'init name'
    private age: number
    protected readonly gender: boolean

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

const tom = new Person('tom', 18)
console.log(tom.name)