import * as graphql from 'graphql';
import { getObjectTypeMetadata, setObjectTypeMetadata } from './metadata';

export function buildObjectType(Type: any) {
  const meta = getObjectTypeMetadata(Type);

  if (!meta || !meta.name) {
    throw new Error(`Object "${Type.name}" is not a valid ObjectType.`);
  }

  const objectType = new graphql.GraphQLObjectType({
    name: meta.name,
    fields: () => {
      const fields = {};

      Object.keys(meta.fields).forEach(fieldName => {
        fields[fieldName] = {
          type: meta.fields[fieldName].typeFn(),
        };
      });

      return fields;
    },
  });

  setObjectTypeMetadata(Type, { objectType });

  return objectType;
}
