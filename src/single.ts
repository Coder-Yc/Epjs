import * as types from '@babel/types'

export default class Signal {
  type: string
  value: any
  constructor(type: string, value: any) {
    this.type = type
    this.value = value
  }

  static Return(value: string) {
    return new Signal('return', value)
  }

  static Break(label: any = null) {
    return new Signal('break', label)
  }

  static Continue(label: string) {
    return new Signal('continue', label)
  }

  static isReturn(signal: any) {
    return signal instanceof Signal && signal.type === 'return'
  }

  static isContinue(signal: any) {
    return signal instanceof Signal && signal.type === 'continue'
  }

  static isBreak(signal: any) {
    return signal instanceof Signal && signal.type === 'break'
  }

  static isSignal(signal: any) {
    // console.log(signal)

    return signal instanceof Signal
  }
}
