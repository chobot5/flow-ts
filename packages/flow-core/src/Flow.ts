

type FlowValue<T> = T extends Flow<infer P> ? P : never

interface IFlow<Value> {
  map: <NewValue>(fn: (value: Value) => NewValue) => Flow<NewValue>
  flatMap: <B>(fn: (value: Value) => Flow<B>) => Flow<B>
}


/*
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

  [Symbol.iterator](): FlowIterator<T> {
    return new FlowIterator(this)
  }
}

*/


class FlowInternal<R> {

  constructor(private operation: () => (...args: any[]) => R   ) {}

  [Symbol.iterator]() {
    return this.operation()
  }
}


export class Flow<Value> implements IFlow<Value> {

  constructor(private value: Value) {

  }

  map<NewValue>(fn: (value: Value) => NewValue) {
    const x = new FlowInternal(() => fn)[Symbol.iterator]()
    return new Flow(fn(this.value))
  }

  flatMap<B>(fn: (value: Value) => Flow<B>) {
     const val = fn(this.value)
    return val
  }       
}

function* flowGenerator<T,R>(value:T, fn: (val: T)=> R) {
  yield fn(value)
}

const x = new Flow(1)
  .map((x) => x + 1)
  .map(() => 'a')
  .map((a) => a)
  .flatMap((a) => {
    console.log(77)
    return new Flow(true).map(a => 'as')
  })
  .map((a) => a)

console.log(x)