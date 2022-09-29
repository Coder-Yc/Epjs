import Epjs from './Ep'
import { parseOptions } from './type/index'

export function runInContext(
  code: string,
  sandBox?: object,
  options?: parseOptions
) {
  return new Epjs(code, { ecmaVersion: 6 }).init({})
}

let str = `
function bar(b) {
  this.a = 2
  this.b = b
}
let foo = new bar(3)
console.log(foo.b)
          `

runInContext(str)
