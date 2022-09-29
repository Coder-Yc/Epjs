function bar(b) {
  this.a = 2
  this.b = b
}
let foo = new bar(3)
console.log(foo.b)
