export interface SpyObject extends Record<string, any> {
  (this: Record<string, unknown>, ...args: Array<any>): unknown;
}

export class Spy<T extends string> {
  called: boolean = false;
  calledArgs: Array<any>[] = [];
  constructor(obj: Record<T, Function>, methodName: T) {
    const savedFn = obj[methodName]
    const spy = this
    obj[methodName] = function() {
      const args = Array.from(arguments);
      spy.called = true
      spy.calledArgs.push(args)
      savedFn.apply(obj, args)
    }
  }
}
