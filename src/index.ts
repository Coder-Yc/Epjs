import Epjs from './Ep'
import { parseOptions } from './type/index'

export function runInContext(
  code: string,
  sandBox?: object,
  options?: parseOptions
) {
  return new Epjs(code, { ecmaVersion: 6 }).init({})
}

let str = `let flag = 1
          let a = 3
          while(a != flag) {
            console.log('11222')
              flag += 1
          }
          for (let i = 0; i < a; i++) {
            console.log(i)
          }
          `

runInContext(str)
