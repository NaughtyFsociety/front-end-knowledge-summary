// 可选成员， 只读成员， 动态成员

export { } // 确保根据其他示例没有成员冲突

// ----------------------------

interface Post {
    title: string
    content: string
    subtitle?: string
    readonly summmary: string
}

const hello: Post = {
    title: 'Hello TypeScript',
    content: 'A javascript superset',
    summmary: 'A javscript'
}

// hello.summmary = 'asdf'  //Cannot assign to 'summmary' because it is a read-only property.ts(2540)

// ------------------------------
interface Cache {
    [prop: string]: string
}

const cache: Cache = {}

cache.foo = 'value'
cache.bar = 'value2'