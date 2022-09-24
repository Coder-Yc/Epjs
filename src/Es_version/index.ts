import ES5_visitors from './es5'
import { createValue } from '../value'
let visitors: any = {
  ...ES5_visitors
}


let standardMap = {
  isFinite: new createValue(isFinite),
  isNaN: new createValue(isNaN),
  parseFloat: new createValue(parseFloat),
  parseInt: new createValue(parseInt),
  decodeURI: new createValue(decodeURI),
  decodeURIComponent: new createValue(decodeURIComponent),
  encodeURI: new createValue(encodeURI),
  encodeURIComponent: new createValue(encodeURIComponent),

  // Fundamental objects
  Object: new createValue(Object),
  Function: new createValue(Function),
  Boolean: new createValue(Boolean),
  Symbol: new createValue(Symbol),
  Error: new createValue(Error),
  EvalError: new createValue(EvalError),
  RangeError: new createValue(RangeError),
  ReferenceError: new createValue(ReferenceError),
  SyntaxError: new createValue(SyntaxError),
  TypeError: new createValue(TypeError),
  URIError: new createValue(URIError),

  // Numbers and dates
  Number: new createValue(Number),
  Math: new createValue(Math),
  Date: new createValue(Date),

  // Text processing
  String: new createValue(String),
  RegExp: new createValue(RegExp),

  // Indexed collections
  Array: new createValue(Array),
  Int8Array: new createValue(Int8Array),
  Uint8Array: new createValue(Uint8Array),
  Uint8ClampedArray: new createValue(Uint8ClampedArray),
  Int16Array: new createValue(Int16Array),
  Uint16Array: new createValue(Uint16Array),
  Int32Array: new createValue(Int32Array),
  Uint32Array: new createValue(Uint32Array),
  Float32Array: new createValue(Float32Array),
  Float64Array: new createValue(Float64Array),

  ArrayBuffer: new createValue(ArrayBuffer),
  DataView: new createValue(DataView),
  JSON: new createValue(JSON),


  console: new createValue(console),
  setTimeout: new createValue(setTimeout),
  clearTimeout: new createValue(clearTimeout),
  setInterval: new createValue(setInterval),
  clearInterval: new createValue(clearInterval)
}

export { visitors, standardMap }
