import { MemberValue, createValue } from '../value'
import Single from '../single'
import * as types from '@babel/types'
import NodeIterator from '../Iterator'
import Signal from '../single'
const visitors: any = {
  Program(Iterator: any) {
    for (const item of Iterator.astCode.body) {
      let type = item.type
      Iterator.evaluate(item)
    }
  },
  ExpressionStatement(Iterator: any) {
    return Iterator.evaluate(Iterator.astCode.expression)
  },
  CallExpression(Iterator: any) {
    let args: any = Iterator.astCode.arguments.map((item: any) => {
      return Iterator.evaluate(item)
    })
    let MemberExpression = Iterator.astCode.callee
    let fun = Iterator.evaluate(MemberExpression)
    let applyValue
    if (MemberExpression.type === 'MemberExpression') {
      applyValue = Iterator.evaluate(MemberExpression.object)
    }
    // console.log('----', args)
    return fun.apply(applyValue, args)
  },
  MemberExpression(Iterator: any) {
    let obj = Iterator.evaluate(Iterator.astCode.object)
    let property = Iterator.astCode.property.name
    return obj[property]
  },
  Identifier(Iterator: any) {
    if (Iterator.astCode.name === 'undefined') {
      return undefined
    }
    // console.log(Iterator.scope.get(Iterator.astCode.name))
    // console.log(Iterator.astCode.name)

    return Iterator.scope.get(Iterator.astCode.name).value
  },
  StringLiteral() {},
  VariableDeclaration(Iterator: any) {
    let declarations = Iterator.astCode.declarations
    let kind = Iterator.astCode.kind
    for (const des of declarations) {
      // console.log(des.init)
      let value = des.init ? Iterator.evaluate(des.init) : undefined
      let { name } = des.id
      //   console.log(Iterator.scope.parentScope)

      if (Iterator.scope.type == 'block' && kind == 'var') {
        Iterator.scope.parentScope.declareScope(value, name, kind)
      } else {
        Iterator.scope.declareScope(value, name, kind)
      }
    }
  },
  VariableDeclarator(Iterator: any) {
    return Iterator.astCode.value
  },
  Literal(Iterator: any) {
    return Iterator.astCode.value
  },
  AssignmentExpression(Iterator: any) {
    const node = Iterator.astCode
    const value = getIdentifierOrMemberExpressionValue(node.left, Iterator)
    let v = Iterator.evaluate(node.right).value
      ? Iterator.evaluate(node.right).value
      : Iterator.evaluate(node.right)
    return visitors.AssignmentExpressionOperatortraverseMap[node.operator](
      value,
      v
    )
  },
  AssignmentExpressionOperatortraverseMap: {
    '=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] = v)
        : (value.value = v),
    '+=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] += v)
        : (value.value += v),
    '-=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] -= v)
        : (value.value -= v),
    '*=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] *= v)
        : (value.value *= v),
    '/=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] /= v)
        : (value.value /= v),
    '%=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] %= v)
        : (value.value %= v),
    '**=': () => {
      throw new Error('canjs: es5 doen\'t supports operator "**=')
    },
    '<<=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] <<= v)
        : (value.value <<= v),
    '>>=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] >>= v)
        : (value.value >>= v),
    '>>>=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] >>>= v)
        : (value.value >>>= v),
    '|=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] |= v)
        : (value.value |= v),
    '^=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] ^= v)
        : (value.value ^= v),
    '&=': (value: MemberValue | createValue, v: any) =>
      value instanceof MemberValue
        ? (value.obj[value.prop] &= v)
        : (value.value &= v)
  },
  FunctionDeclaration(Iterator: any) {
    let fn = visitors.FunctionExpression(Iterator)
    // console.log(fn)
    Iterator.scope.varDeclare(fn, Iterator.astCode.id.name)
    return fn
  },
  FunctionExpression(Iterator: any) {
    let code = Iterator.astCode
    // console.log(code)

    const fn = function () {
      const scope = Iterator.createScope('function')
      //   scope.constDeclare(this, 'this')
      scope.constDeclare(arguments, 'arguments')

      //不能用forEach,arguments不好处理
      for (let i = 0; i < code.params.length; i++) {
        const { name } = code.params[i]
        scope.varDeclare(arguments[i], name)
      }
      let single = Iterator.evaluate(code.body, { scope })
      if (Single.isReturn(single)) {
        console.log('--------')
        return single.value
      }
    }
    Object.defineProperties(fn, {
      name: { value: code.id ? code.id.name : '' },
      length: { value: code.params.length }
    })
    return fn
  },
  BlockStatement(Iterator: any) {
    //创建一个块级作用域
    let scope = Iterator.createScope('block')
    // console.log(scope)
    
    for (const node of Iterator.astCode.body) {
      if (node.type === 'FunctionDeclaration') {
        Iterator.evaluate(node, { scope })
      } else if (node.type == 'VariableDeclaration' && node.kind === 'var') {
        for (const des of node.declarations) {
          if (des.init) {
            scope.declareScope(
              Iterator.evaluate(des.init, { scope }),
              des.id.name,
              node.kind
            )
          } else {
            scope.declareScope(undefined, des.id.name, node.kind)
          }
        }
      }
    }
    //处理return,break等情况
    for (const node of Iterator.astCode.body) {
      if (node.type === 'FunctionDeclaration') {
        continue
      }
      let single = Iterator.evaluate(node, { scope })
      if (Single.isSignal(single)) {
        return single
      }
    }
  },
  ReturnStatement(Iterator: any) {
    let value
    if (Iterator.astCode.argument) {
      value = Iterator.evaluate(Iterator.astCode.argument)
    }
    return Signal.Return(value)
  }
}
function getIdentifierOrMemberExpressionValue(node: any, nodeIterator: any) {
  if (node.type === 'Identifier') {
    let a = nodeIterator.scope.get(node.name)
    return a
  } else if (node.type === 'MemberExpression') {
    const obj = nodeIterator.traverse(node.object)
    const name = getPropertyName(node, nodeIterator)
    return new MemberValue(obj, name)
  } else {
    throw new Error(
      `canjs: Not support to get value of node type "${node.type}"`
    )
  }
}
function getPropertyName(node: any, nodeIterator: any) {
  if (node.computed) {
    return nodeIterator.traverse(node.property)
  } else {
    return node.property.name
  }
}
export default visitors
