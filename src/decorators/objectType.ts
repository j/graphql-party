import { getOrCreateObjectTypeMetadata } from '../metadata';

export function ObjectType({
  name,
  description,
}: { name?: string; description?: string } = {}): Function {
  return (target: Function) => {
    const meta = getOrCreateObjectTypeMetadata(target);

    meta.setName(name || target.name);
    meta.setDescription(description);
  };
}
