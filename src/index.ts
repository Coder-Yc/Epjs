import Epjs from './Ep'
import { parseOptions } from './type/index'

export function runInContext(
  code: string,
  sandBox?: object,
  options?: parseOptions
) {
  return new Epjs(code, { ecmaVersion: 6 }).init({})
}

let str = `function test(a, b) {
              var name = "hello world";
              console.log(name)
            }
            test(1, 2)`

runInContext(str)
