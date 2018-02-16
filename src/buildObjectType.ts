import {
  getMutationObjectTypeMetadata,
  getObjectTypeMetadata,
  getQueryObjectTypeMetadata,
  setObjectTypeMetadata,
} from './metadata';
import { GraphQLObjectType } from 'graphql';

function getFieldsFromMeta(meta) {
  const fields = {};

  Object.keys(meta.fields).forEach(fieldName => {
    const { getArgs, getType, getResolver } = meta.fields[fieldName];

    fields[fieldName] = {
      type: getType(),
      args: getArgs(),
    };

    const resolve = getResolver();

    if (resolve) {
      fields[fieldName].resolve = resolve;
    }
  });

  return fields;
}

export function buildObjectType(ClassWithTypeMetadata: any) {
  const meta = getObjectTypeMetadata(ClassWithTypeMetadata);

  if (!meta || !meta.name) {
    throw new Error(
      `Object "${ClassWithTypeMetadata.name}" is not a valid ObjectType.`
    );
  }

  const objectType = new meta.Type({
    name: meta.name,
    fields: () => getFieldsFromMeta(meta),
  });

  setObjectTypeMetadata(ClassWithTypeMetadata, { objectType });

  return objectType;
}

function createBuildTypFn(name: string, getMetadata?: Function): Function {
  return function(ClassesWithMetadata: any[]) {
    let hasFields = false;
    let fields = {};

    ClassesWithMetadata.forEach(ClassWithMetadata => {
      const meta = getMetadata(ClassWithMetadata);

      if (meta) {
        hasFields = true;

        fields = {
          ...fields,
          ...getFieldsFromMeta(meta),
        };
      }
    });

    return hasFields
      ? new GraphQLObjectType({
          name,
          fields: fields,
        })
      : null;
  };
}

export const buildQueryObjectType = createBuildTypFn(
  'Query',
  getQueryObjectTypeMetadata
);

export const buildMutationObjectType = createBuildTypFn(
  'Mutation',
  getMutationObjectTypeMetadata
);
