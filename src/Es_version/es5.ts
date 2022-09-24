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
    // console.log(Iterator.astCode)
    let id = 0
    let args: any = Iterator.astCode.arguments.map((item: any) => {
      return Iterator.evaluate(item).value
    })
    let MemberExpression = Iterator.astCode.callee
    let fun = Iterator.evaluate(MemberExpression)
    let applyValue
    if (MemberExpression.type === 'MemberExpression') {
      applyValue = Iterator.evaluate(MemberExpression.object)
    }

    fun.apply(applyValue, args)
  },
  MemberExpression(Iterator: any) {
    // console.log(Iterator.astCode)
    let obj = Iterator.evaluate(Iterator.astCode.object).value
    let property = Iterator.astCode.property.name
    return obj[property]
  },
  Identifier(Iterator: any) {
    if (Iterator.astCode.name === 'undefined') {
      return undefined
    }
    return Iterator.scope.get(Iterator.astCode.name)
  },
  StringLiteral() {},
  VariableDeclaration(Iterator: any) {
    let declarations = Iterator.astCode.declarations
    let kind = Iterator.astCode.kind
    for (const des of declarations) {
      // console.log(des.init)
      let value = des.init ? Iterator.evaluate(des.init) : undefined
      let { name } = des.id
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
    let left = Iterator.astCode.left
    let right = Iterator.astCode.right
    if (left) {
      left = Iterator.evaluate(left)
    }
    if (right) {
      right = Iterator.evaluate(right)
    }
    left.set(right)
  }
}

export default visitors
