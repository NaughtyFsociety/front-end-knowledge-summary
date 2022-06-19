// point free
// hello  world => hello_world

const fp = require('lodash/fp')

const f = fp.flowRight(fp.replace(/\s+/g, '-'),fp.toLower)

console.log(f('hello  world'))
