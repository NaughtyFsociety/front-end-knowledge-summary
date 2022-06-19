// 模拟常用高阶函数： map,every,some

// map
const map = (array, fn) => {
    let result = [];
    for (let value of array) {
        result.push(fn(value))
    }
    return result
}

// 测试
let arr = [1,2,3,4]
arr = map(arr, v => v * v)
console.log(arr)  // [ 1, 4, 9, 16 ]

// every
const every = (array, fn) => {
    let result = true
    for (let value of array) {
        result = fn(value)
        if (!result) {
            break
        }
    }
    return result
}

// 测试
let arr1 = [9, 12, 14]
let r = every(arr1, v => v > 10)
console.log(r)  // false

// some
const some = (array, fn) => {
    let result = false
    for (let value of array) {
        result = fn(value)
        if (result) {
            break
        }
    }
    return result
}

// 测试
let arr2 = [1, 3, 5, 9]
let r2 = some(arr2, v => v % 2 === 0)
console.log(r2) // false
