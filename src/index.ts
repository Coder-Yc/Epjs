import Epjs from './Ep'
import { parseOptions } from './type/index'

export function runInContext(
  code: string,
  sandBox?: object,
  options?: parseOptions
) {
  return new Epjs(code, { ecmaVersion: 6 }).init({})
}

let str = 'var a = 1111; a= 2222; console.log(a);'

runInContext(str)
