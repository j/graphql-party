import { GraphQLInputObjectType } from 'graphql';
import { setObjectTypeMetadata } from '../metadata';

export function InputType(name?: string): Function {
  return (target: Function) => {
    setObjectTypeMetadata(target, { name, Type: GraphQLInputObjectType });
  };
}
