import { getOrCreateObjectTypeMetadata } from '../metadata';

export function ObjectType(name?: string): Function {
  return (target: Function) => {
    const meta = getOrCreateObjectTypeMetadata(target);

    meta.setName(name || target.name);
  };
}
