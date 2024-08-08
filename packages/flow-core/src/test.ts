import * as test from 'node:test'

class HelloIterator implements Iterator<number | undefined> {
  private index = 0

  constructor(private values: number[]) {}
  next() {
    this.index++
    return {
      value: this.values[this.index],
      done: this.values.length === this.index,
    }
  }
}

const dfs = function* () {
  yield 3
  yield 4
}

function* generate() {
  yield 1
  yield 2
  yield* dfs()
}
const llll = generate()

class MyIterator implements Iterator<number> {
  constructor(private value: number) {}

  next() {
    return {
      value: this.value,
      done: false,
    }
  }
}

class MyIterable implements Iterable<number> {
  constructor(private value: number) {}

  [Symbol.iterator]() {
    return new MyIterator(this.value)
    /*
    const fu = function*() {
      yield 111
    }

    return fu()
     */

    /*
    return {
      next: () => ({
        aaa: 666,
        done: true
      })
    }*/
  }
}

const myIterableInst = new MyIterable(4)
const aaa = myIterableInst[Symbol.iterator]()
const fu = aaa.next()

const lefu = function* () {
  yield* myIterableInst
}

const x = (): number | void => lefu().next().value

export const YieldWrapTypeId: unique symbol = Symbol.for('effect/Utils/YieldWrap')

/**
 * @since 3.0.6
 */
export class YieldWrap<T> {
  /**
   * @since 3.0.6
   */
  readonly #value: T
  constructor(value: T) {
    this.#value = value
  }
  /**
   * @since 3.0.6
   */
  [YieldWrapTypeId](): T {
    return this.#value
  }
}

const sdfs = new YieldWrap(1)[YieldWrapTypeId]()

export const testId: unique symbol = Symbol.for('val')

interface Operation<O> {
  arguments: any[]
  fn: (...args: any[]) => O
}

/*
class OperationIterator implements Iterator<number | undefined> {
  private index = 0
  constructor(private operations: Operation[]) {}

  next() {
    const op = this.operations[this.index]
    if(op) {

      this.index++

      return {
        value: op.fn(...op.arguments),
        done: this.operations.length === this.index
      }
    }

    return {
      value:undefined,
      done: true
    }
  }

}

 */

class TestInternal<O> {
  private operation: Operation<O> | undefined = undefined
  private test: Test<O> | undefined = undefined
  private prevTest: Test<unknown> | undefined = undefined

  constructor() {}

  map<I>(fn: (value: I) => O, self: Test<I>) {
    console.log('TestInternal', 'map', fn.toString())
    this.operation = {
      arguments: [],
      fn,
    }

    this.prevTest = self
    const newTest = new Test<O>()
    newTest.setInternal(this)
    return newTest
  }

  getParent() {
    return this.prevTest
  }

  runOperation(): O | undefined {
    console.log('TestInternal', 'runOperation')
    if (this.operation) {
      const opVal = this.operation.fn(this.prevTest?.getValue())
      console.log('TestInternal', 'opVal', opVal)
      if (this.test) {
        return this.test.setValue(opVal).run()
      }
    }
  }

  [Symbol.iterator]() {
    // return new OperationIterator(this.operation)
  }
}

class Test<I> {
  private internal: TestInternal<unknown> | undefined = undefined
  constructor(protected value: I | null = null) {}

  setInternal(internal: TestInternal<I>) {
    this.internal = internal
  }

  getInternal() {
    return this.internal
  }

  map<O>(fn: (value: I) => O) {
    console.log('Test', 'map', this.value)
    const internal = new TestInternal<O>().map(fn, this)
    if (!this.internal) {
      this.internal = internal.getInternal()
    }

    return internal
  }

  run<O>(): O | undefined {
    console.log('RUN', this.value, this.internal)
    if (this.internal) {
      console.log('Test', 'run', this.value)
      return this.internal.runOperation() as O
    }
  }

  getValue() {
    return this.value
  }

  setValue(value: I) {
    this.value = value
    return this
  }
}

const from = <I>(value: I): Test<I> => new Test<I>(value)

const testik = from(1)
  .map((x) => x + 1)
  .map((a) => {
    console.log('testik')
    return a + 'jh'
  })
  .map((c) => c)

const runTest = <A>(test: Test<A>): A => {
  const findRoot = (test: Test<unknown>): Test<unknown> => {
    const parent = test.getInternal()?.getParent()
    if (parent) {
      return findRoot(parent)
    }

    return test
  }

  return findRoot(test).run() as A
}

const aa = runTest(testik)
console.log('aa', aa)
