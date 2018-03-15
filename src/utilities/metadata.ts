function isObject(val) {
  return val && (typeof val === 'function' || typeof val === 'object');
}

export function getMetadata<T>(
  metadataKey: string | Symbol,
  target: Function,
  targetKey?: string
): T {
  if (!isObject(target)) {
    return undefined;
  }

  const result = getOwnMetadata<T>(metadataKey, target, targetKey);

  return result === undefined
    ? getMetadata<T>(metadataKey, Object.getPrototypeOf(target), targetKey)
    : result;
}

export function getOwnMetadata<T>(
  metadataKey: string | Symbol,
  target: Function,
  targetKey?: string
): T {
  if (!isObject(target)) {
    return undefined;
  }

  return Reflect.getOwnMetadata(metadataKey, target, targetKey) as T;
}

export function defineMetadata(
  metadataKey: string | Symbol,
  metadataValue: Object,
  target: Function,
  targetKey?: string
): void {
  Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
}

export function getOrCreateOwnMetadata<T>(
  metadataKey: string | Symbol,
  MetadataType: { new (): T },
  target: Function,
  targetKey?: string
): T {
  let result = getOwnMetadata<T>(metadataKey, target, targetKey);

  if (result === undefined) {
    console.log(MetadataType);
    result = new MetadataType();

    defineMetadata(metadataKey, result, target, targetKey);
  }

  return result;
}
