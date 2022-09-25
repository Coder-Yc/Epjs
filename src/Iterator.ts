import { visitors } from './Es_version/index'
import Scope from './scope'

type scopeType = 'function' | 'block'
export default class NodeIterator {
  astCode: any
  scope?: object
  constructor(astCode: object, scope: object = {}) {
    this.astCode = astCode
    this.scope = scope
  }

  evaluate(ast: any, option: any = {}) {
    let _evaluate = visitors[ast.type]

    let scope = option.scope || this.scope
    let Iterator = new NodeIterator(ast, scope)
    if (!_evaluate) {
      throw new Error(`Epjs: unKnow node type ${ast.node}`)
    }
    return _evaluate(Iterator)
  }

  createScope(type: scopeType) {
    return new Scope(type, this.scope)
  }
}
