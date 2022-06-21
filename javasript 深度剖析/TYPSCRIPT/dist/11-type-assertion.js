"use strict";
// 类型断言
Object.defineProperty(exports, "__esModule", { value: true });
// 假设这个nums 来自一个明确的接口
const nums = [110, 120, 119, 112];
const res = nums.find(i => i > 0);
const num1 = res;
const num2 = res; // JSX 下不能使用
//# sourceMappingURL=11-type-assertion.js.map