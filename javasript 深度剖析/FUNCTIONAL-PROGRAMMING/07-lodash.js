// 演示lodash
// first / last / toUpper / reverse / each /includes / find / findIndex

const _ = require('lodash')

const array = ['jack', 'tom', 'lucy', 'kate']

console.log(_.first(array)) // jack
console.log(_.last(array)) // kate
console.log(_.toUpper(array)) // JACK,TOM,LUCY,KATE
console.log(_.reverse(array)) // [ 'kate', 'lucy', 'tom', 'jack' ]

const r = _.each(array,(item, index) => {
    console.log(item, index)
})

console.log(r) // [ 'kate', 'lucy', 'tom', 'jack' ]
