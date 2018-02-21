import { GraphQLInputObjectType } from 'graphql';
import { getOrCreateObjectTypeMetadata } from '../metadata';

export function InputType(name?: string): Function {
  return (target: Function) => {
    const meta = getOrCreateObjectTypeMetadata(target);

    meta.setName(name || target.name);
    meta.setType(GraphQLInputObjectType);
  };
}
