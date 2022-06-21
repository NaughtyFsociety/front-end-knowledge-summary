// 枚举 (Enum)

export { }

// const PostStatus = {
//     Draft: 0,
//     Unpublished: 1,
//     Published: 2,
// }


const enum PostStatus {
    Draft = 2,
    Unpublished,
    Published
}



const post = {
    title: 'Hello TypeScript',
    content: 'TypeScript is a typed superset of Javascript.',
    status: PostStatus.Published // 3 //0
}