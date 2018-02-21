import { GraphQLInputObjectType } from 'graphql';
import { getOrCreateObjectTypeMetadata } from '../metadata';

export function InputType({
  name,
  description,
}: { name?: string; description?: string } = {}): Function {
  return (target: Function) => {
    const meta = getOrCreateObjectTypeMetadata(target);

    meta.setName(name || target.name);
    meta.setType(GraphQLInputObjectType);
    meta.setDescription(description);
  };
}
