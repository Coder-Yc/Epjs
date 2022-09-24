import { visitors } from './Es_version/index'
import Scope from './scope'
export default class NodeIterator {
  astCode: any
  scope?: object
  constructor(astCode: object, scope: object = {}) {
    this.astCode = astCode
    this.scope = scope
  }

  evaluate(ast: any) {
    let _evaluate = visitors[ast.type]

    let scope = this.scope
    let Iterator = new NodeIterator(ast, scope)
    if (!_evaluate) {
      throw new Error(`Epjs: unKnow node type ${ast.node}`)
    }
    return _evaluate(Iterator)
  }

  createScope() {
    return new Scope()
  }
}
