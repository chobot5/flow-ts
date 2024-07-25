type FlowValue<T> = T extends Flow<infer P> ? P : never

interface Flow<Value> {
  of: (value: Value) => Flow<Value>
  map: <NewValue>(fn: (value: Value) => NewValue) => Flow<NewValue>
  flatMap: <B>(fn: (value: Value) => Flow<B>) => Flow<B>
  run: () => Value
}

class FlowIterator<T> implements Iterator<T> {
  private done = false

  constructor(private flow: FlowInternal<T>) {}

  next<ReturnValue>(r: ReturnValue): IteratorResult<T, ReturnValue> {
    if (this.done) {
      return { done: true, value: r }
    }

    this.done = true
    return { done: false, value: this.flow.run() }
  }

  [Symbol.iterator](): FlowIterator<T> {
    return new FlowIterator(this.flow)
  }
}

class FlowInternal<T> implements Iterable<T> {
  constructor(private value: T) {}

  of(value: T): FlowInternal<T> {
    return new FlowInternal(value)
  }

  map<NewValue>(fn: (value: T) => NewValue): FlowInternal<NewValue> {
    return new FlowInternal(fn(this.value))
  }

  flatMap<B>(fn: (value: T) => FlowInternal<B>): FlowInternal<B> {
    return fn(this.value)
  }

  run(): T {
    return this.value
  }

  [Symbol.iterator](): FlowIterator<T> {
    return new FlowIterator(this)
  }
}

const A = new FlowInternal(1).map((x) => x + 1).map((x) => x + 1)

function* genxxx() {
  yield A[Symbol.iterator]().next()
  yield A[Symbol.iterator]().next()
}

console.log(A[Symbol.iterator]().next())
console.log(A[Symbol.iterator]().next())

export const Flow = <Value>(value: Value) => {
  const runnable: Flow<Value> = {
    of: <Value>(value: Value) => {
      return Flow(value)
    },
    map: <NewValue>(fn: (value: Value) => NewValue) => {
      return Flow(fn(value))
    },
    flatMap: <B>(fn: (v: Value) => Flow<B>) => {
      const val = fn(value)
      return val
    },
    run: () => value,
  }

  return runnable
}

const x = Flow(1)
  .map((x) => x + 1)
  .map(() => 'a')
  .map((a) => a)
  .flatMap((a) => Flow('as'))
  .map((a) => a)
  .run()
