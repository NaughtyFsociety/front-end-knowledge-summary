// 类型断言

export { } //确保跟其他实例没有成员冲突

// 假设这个nums 来自一个明确的接口

const nums = [110, 120, 119, 112]

const res = nums.find(i => i > 0)

const num1 = res as number

const num2 = <number>res // JSX 下不能使用