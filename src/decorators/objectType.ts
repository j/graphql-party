import { setObjectTypeMetadata } from '../metadata';

export function ObjectType(name?: string): Function {
  return (target: Function) => {
    setObjectTypeMetadata(target, { name });
  };
}
