interface Flow<Value> {
    of: (value: Value) => Flow<Value>
    map: <NewValue>(fn: (value: Value) => NewValue) => Flow<NewValue>
    flatMap: <NewValue, R = Flow<NewValue>>(fn: (value: Value) => R) => R
    run: () => Value
  }
  
  export const Flow = <Value>(value: Value) => {
    const runnable = {
      of: <Value>(value: Value): Flow<Value> => {
        return Flow(value)
      },
      map: <NewValue>(fn: (value: Value) => NewValue): Flow<NewValue> => {
        return Flow(fn(value))
      },
      flatMap: <NewValue, R extends Flow<NewValue>>(
        fn: (value: Value) => R
      ): R => {
        const x = fn(value)
        return fn(value)
      },
      run: () => value
    }
  
    return runnable
  }
  
  const a = Flow(1)
  
  const x = Flow(1)
    .map((x) => x + 1)
    .map(() => 'a')
    .map((a) => a)
    .flatMap((a) => Flow(666))
    .map((a) => a)
    .run()
  