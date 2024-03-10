export abstract class AbstractSingleton<T> {
  private static instances = new Map<string, any>();

  protected constructor() { }

  static getInstance<T>(this: new () => T): T {
    const className = this.name;
    if (!AbstractSingleton.instances.has(className)) {
      AbstractSingleton.instances.set(className, new this());
    }
    return AbstractSingleton.instances.get(className);
  }
}
