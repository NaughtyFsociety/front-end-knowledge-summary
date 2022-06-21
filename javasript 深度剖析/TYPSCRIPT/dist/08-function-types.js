"use strict";
// 函数类型
Object.defineProperty(exports, "__esModule", { value: true });
function func1(a, b = 10, ...rest) {
    return 'func1';
}
func1(100, 200);
func1(100);
func1(100, 200, 300);
const func2 = function (a, b) {
    return 'func2';
};
//# sourceMappingURL=08-function-types.js.map