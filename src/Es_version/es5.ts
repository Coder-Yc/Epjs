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
    let applyValue: any = global
    if (MemberExpression.type === 'MemberExpression') {
      applyValue = Iterator.evaluate(MemberExpression.object)
        ? global
        : Iterator.evaluate(MemberExpression.object)
    }
    // console.log('----111111', args)
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

    const fn = function (this: any) {
      const scope = Iterator.createScope('function')

      // console.log('-------', this)
      scope.constDeclare(this, 'this')
      scope.constDeclare(arguments, 'arguments')

      //不能用forEach,arguments不好处理
      for (let i = 0; i < code.params.length; i++) {
        const { name } = code.params[i]
        scope.varDeclare(arguments[i], name)
      }
      let single = Iterator.evaluate(code.body, { scope })
      if (Single.isReturn(single)) {
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
    // console.log(Iterator.astCode);

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
        return single.value
      }
    }
  },
  ReturnStatement(Iterator: any) {
    let value
    if (Iterator.astCode.argument) {
      value = Iterator.evaluate(Iterator.astCode.argument)
    }
    return Signal.Return(value)
  },
  IfStatement(Iterator: any) {
    let test = Iterator.evaluate(Iterator.astCode.test)
    if (test) {
      Iterator.evaluate(Iterator.astCode.consequent)
    }
  },
  BinaryExpression(Iterator: any) {
    let left = Iterator.evaluate(Iterator.astCode.left)
    let right = Iterator.evaluate(Iterator.astCode.right)
    return visitors.BinaryExpressionOperatorEvaluateMap[
      Iterator.astCode.operator
    ](left, right)
  },
  BinaryExpressionOperatorEvaluateMap: {
    '==': (a: any, b: any) => a == b,
    '!=': (a: any, b: any) => a != b,
    '===': (a: any, b: any) => a === b,
    '!==': (a: any, b: any) => a !== b,
    '<': (a: any, b: any) => a < b,
    '<=': (a: any, b: any) => a <= b,
    '>': (a: any, b: any) => a > b,
    '>=': (a: any, b: any) => a >= b,
    '<<': (a: any, b: any) => a << b,
    '>>': (a: any, b: any) => a >> b,
    '>>>': (a: any, b: any) => a >>> b,
    '+': (a: any, b: any) => a + b,
    '-': (a: any, b: any) => a - b,
    '*': (a: any, b: any) => a * b,
    '/': (a: any, b: any) => a / b,
    '%': (a: any, b: any) => a % b,
    '**': (a: any, b: any) => {
      throw new Error('evil-eval: es5 not support operator "**"')
    },
    '|': (a: any, b: any) => a | b,
    '^': (a: any, b: any) => a ^ b,
    '&': (a: any, b: any) => a & b,
    in: (a: any, b: any) => a in b,
    instanceof: (a: any, b: any) => a instanceof b
  },
  WhileStatement(Iterator: any) {
    let test = Iterator.astCode.test
    while (Iterator.evaluate(test)) {
      let signal = Iterator.evaluate(Iterator.astCode.body)
      if (Signal.isSignal(signal)) {
        if (Signal.isBreak(signal)) {
          break
        } else if (Signal.isContinue(signal)) {
          continue
        } else if (Signal.isReturn(signal)) {
          return
        }
        return signal
      }
    }
  },
  ForStatement(Iterator: any) {
    let code = Iterator.astCode
    let scope = Iterator.scope

    if (
      code.init &&
      code.init.type == 'VariableDeclaration' &&
      code.init.kind == 'var'
    ) {
      scope = Iterator.createScope('block')
    }
    for (
      code.init && Iterator.evaluate(code.init, { scope });
      code.test ? Iterator.evaluate(code.test, { scope }) : true;
      code.update && Iterator.evaluate(code.update, { scope })
    ) {
      // console.log(Iterator.evaluate(code.update, { scope }))

      const signal = Iterator.evaluate(code.body)
      // console.log(signal)

      if (Signal.isSignal(signal)) {
        if (Signal.isBreak(signal)) {
          break
        } else if (Signal.isContinue(signal)) {
          continue
        }
        return signal
      }
    }
  },
  UpdateExpression(Iterator: any) {
    const { operator, prefix } = Iterator.astCode
    const { name } = Iterator.astCode.argument
    let val = Iterator.scope.get(name).value
    operator === '++'
      ? Iterator.scope.set(name, val + 1)
      : Iterator.scope.set(name, val - 1)

    if (operator === '++' && prefix) {
      return ++val
    } else if (operator === '++' && !prefix) {
      return val++
    } else if (operator === '--' && prefix) {
      return --val
    } else {
      return val--
    }
  },
  ThisExpression(Iterator: any) {
    return Iterator.scope.get('this') == undefined
      ? null
      : Iterator.scope.get('this').value
  },
  NewExpression(Iterator: any) {
    const fn = Iterator.evaluate(Iterator.astCode.callee)
    const args = Iterator.astCode.arguments.map((arg: any) =>
      Iterator.evaluate(arg)
    )
    return new (fn.bind(null, ...args))()
  }
}
function getIdentifierOrMemberExpressionValue(node: any, nodeIterator: any) {
  if (node.type === 'Identifier') {
    let a = nodeIterator.scope.get(node.name)
    return a
  } else if (node.type === 'MemberExpression') {
    const obj = nodeIterator.evaluate(node.object)
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
