export function isStaticFunction(target, methodName, descriptor) {
  return (
    typeof target.prototype !== 'undefined' &&
    target[methodName] === descriptor.value
  );
}

export function isStaticProperty(target, propertyName) {
  return typeof target.prototype !== 'undefined' && target[propertyName];
}
