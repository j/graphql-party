export function isStaticFunction(target, methodName, descriptor) {
  if (descriptor) {
    return (
      typeof target.prototype !== 'undefined' &&
      target[methodName] === descriptor.value
    );
  }

  return (
    typeof target.prototype !== 'undefined' &&
    typeof target[methodName] === 'function'
  );
}

export function isStaticProperty(target, propertyName) {
  return typeof target.prototype !== 'undefined' && target[propertyName];
}
