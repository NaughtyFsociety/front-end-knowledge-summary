"use strict";
// 任意类型 (弱类型)
function stringify(value) {
    return JSON.stringify(value);
}
stringify('string');
stringify(100);
stringify(true);
let foo = 'string';
foo = 100;
foo.bar();
//any 类型是不安全的
//# sourceMappingURL=09-any-types.js.map