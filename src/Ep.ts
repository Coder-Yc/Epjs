import { parse } from 'acorn'
import { parseOptions } from './type/index'
import NodeIterator from './Iterator'
import Scope from './scope'
export default class Epjs {
  code: string
  options: parseOptions
  ast: any
  constructor(code: string, options: parseOptions = {}) {
    this.code = code
    this.ast = null
    this.options = {
      ecmaVersion: 5,
      sourceType: 'module',
      ...options
    }
  }

  init(sandBox: object) {
    let scope = new Scope('function')
    Object.entries(sandBox).forEach((item: Array<any>) => {
      let key: string = item[0]
      let value: object = item[1]
      scope.addScope({ [key]: value })
    })
    
    this.ast = parse(this.code, JSON.parse(JSON.stringify(this.options)))
    let Iterator = new NodeIterator(this.ast, scope)
    Iterator.evaluate(this.ast)
  }
}
