import { standardMap } from './Es_version/index'
import { createValue } from './value'
type scopeType = 'function' | 'block'
interface globeScopeType {
  [key: string]: any
}
export default class Scope {
  parentScope: any
  type: scopeType
  globeScope: globeScopeType
  declaration: globeScopeType
  constructor(type: scopeType = 'block', parentScope?: any) {
    this.parentScope = parentScope == undefined ? null : parentScope
    this.type = type
    this.globeScope = standardMap
    this.declaration = Object.create(null)
  }

  get(name: string) {
    if (this.declaration[name]) {
      return this.declaration[name]
    } else if (this.parentScope) {
      return this.parentScope.get(name)
    } else if (this.globeScope[name]) {
      return this.globeScope[name]
    }
    throw new Error(`${name} is not define`)
  }
  set(name: any, value: any) {
    if (this.declaration[name]) {
      this.declaration[name].set(value)
    } else if (this.parentScope) {
      this.parentScope.set(name, value)
    } else if (this.globeScope[name]) {
      return this.globeScope.set(name, value)
    } else {
      throw new ReferenceError(`${name} is not defined`)
    }
  }
  addScope(otherScope: object) {
    this.globeScope = { ...this.globeScope, ...otherScope }
  }
  declareScope(value: string, name: string, type?: string) {
    switch (type) {
      case 'var':
        return this.varDeclare(value, name, type)
        break
      case 'let':
        return this.letDeclare(value, name, type)
        break
      case 'const':
        return this.constDeclare(value, name, type)
        break
    }
  }
  varDeclare(value: string, name: string, type: string) {
    let scope = this
    while (scope.parentScope && scope.parentScope.type !== 'function') {
      scope = scope.parentScope
    }
    scope.declaration[name] = new createValue(value, type)
    return scope.declaration[name]
  }
  letDeclare(value: string, name: string, type: string) {
    let scope = this
    if (this.declaration[name] != undefined) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    scope.declaration[name] = new createValue(value, type)
    return scope.declaration[name]
  }
  constDeclare(value: unknown, name: any, type?: string) {
    let scope = this
    if (this.declaration[name] != undefined) {
      throw new SyntaxError(`Identifier ${name} has already been declared`)
    }
    scope.declaration[name] = new createValue(value, type)
    return scope.declaration[name]
  }
}
