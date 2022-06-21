// 任意类型 (弱类型)

function stringify(value: any) {
    return JSON.stringify(value)
}


stringify('string')

stringify(100)

stringify(true)

let foo: any = 'string'

foo = 100

foo.bar()

//any 类型是不安全的