// 柯里化演示

// 普通的纯函数
// function checkAge (min, age) {
//     return age >= min
// }

// console.log(checkAge(18, 20))
// console.log(checkAge(18, 24))
// console.log(checkAge(22, 24))

// function checkAge (min) {
//     return function (age) {
//         return age >= min
//     }
// }

// ES6
let checkAge = min => (age => age >= min)

let checkAge18 = checkAge(18)
let checkAge20 = checkAge(20)

console.log(checkAge18(20))
console.log(checkAge18(24))


