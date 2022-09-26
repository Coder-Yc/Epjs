class createValue {
  value: any
  type: string
  constructor(value: any, type: string = '') {
    this.value = value
    this.type = type
  }
  get() {
    return this.value
  }
  set(value: string) {
    if (this.type !== 'const') {
      this.value = value
    } else if (this.type == 'const' && typeof this.value !== 'object') {
      throw new Error('Assignment to constant variable')
    }
  }
}

class MemberValue {
  obj: any
  prop: any
  constructor(obj: any, prop: any) {
    this.obj = obj
    this.prop = prop
  }

  set(value: any) {
    this.obj[this.prop] = value
  }

  get() {
    return this.obj[this.prop]
  }
}

export { createValue, MemberValue }
