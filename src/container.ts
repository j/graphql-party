const CONTAINER_METADATA_KEY = Symbol('Container');

export type targetCtor<T> = { new (...args: any[]): T };

export type containerType = {
  get(target: any): any;
  get<T>(target: targetCtor<T>): T;
  set?<T>(target: targetCtor<T>, object: T): void;
};

export interface UseContainerOptions {
  /**
   * If set to true, then default container will be used in the case if given container haven't returned anything.
   */
  fallback?: boolean;

  /**
   * If set to true, then default container will be used in the case if given container thrown an exception.
   */
  fallbackOnErrors?: boolean;
}

interface ContainerMetadata {
  container: containerType;
  options: UseContainerOptions;
}

class Container {
  private instances: { target: Function; object: any }[] = [];

  set<T>(target: targetCtor<T>, object: T): targetCtor<T> {
    if (this.instances.find(instance => instance.target === target)) {
      throw new Error('Target already exists in container.');
    }

    this.instances.push({ target, object });

    return target;
  }

  get<T>(target: targetCtor<T>): T {
    let instance = this.instances.find(instance => instance.target === target);
    if (!instance) {
      instance = { target, object: new target() };
      this.instances.push(instance);
    }

    return instance.object;
  }
}

let defaultContainer = new Container();
let userContainer: ContainerMetadata | undefined;

/**
 * Sets container to be used by this library.
 */
export function useContainer<T>(
  target: targetCtor<T>,
  container: containerType,
  options?: UseContainerOptions
) {
  Reflect.defineMetadata(
    CONTAINER_METADATA_KEY,
    { container, options },
    target
  );
}

/**
 * Sets container to be used by this library.
 */
export function setContainer(
  container?: containerType,
  options?: UseContainerOptions
) {
  userContainer = { container, options };
}

export function setInstance<T>(
  target: targetCtor<T>,
  instance: T
): targetCtor<T> {
  return defaultContainer.set<T>(target, instance);
}

/**
 * Gets the IOC container used by this library.
 */
export function getFromContainer<T>(target: targetCtor<T>): T {
  // see if target has a specific container to load from
  let meta: ContainerMetadata = Reflect.getMetadata(
    CONTAINER_METADATA_KEY,
    target
  );

  // try for a global user container
  if (!meta) {
    meta = userContainer;
  }

  if (meta) {
    try {
      const instance = meta.container.get(target);

      if (instance) {
        return instance;
      }

      if (!meta.options || !meta.options.fallback) {
        return instance;
      }
    } catch (err) {
      if (!meta.options || !meta.options.fallbackOnErrors) {
        throw err;
      }
    }
  }

  return defaultContainer.get<T>(target);
}

export function resetContainer() {
  defaultContainer = new Container();
  userContainer = undefined;
}
