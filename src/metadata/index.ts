import 'reflect-metadata';
import { GraphQLType } from 'graphql';
import { WrappedType } from '../utilities/wrappedType';
import { MetadataField, MetadataFieldOpts } from './metadataField';
import { Metadata } from './metadata';

export { MetadataField } from './metadataField';
export { Metadata, GraphQLObjectOrInputTypeCtor } from './metadata';

export const OBJECT_TYPE_KEY = Symbol('@ObjectType');
export const OBJECT_QUERY_TYPE_KEY = Symbol('@Query');
export const OBJECT_MUTATION_TYPE_KEY = Symbol('@Mutation');

function createAddFieldFn(key: Symbol) {
  return function(
    target,
    fieldName: string,
    type: GraphQLType | WrappedType | Object,
    opts?: MetadataFieldOpts
  ) {
    const meta = Metadata.getOrCreateInstance(target, key);

    if (meta.hasField(fieldName)) {
      throw new Error(`Duplicate field "${fieldName}".`);
    }

    meta.addField(new MetadataField(fieldName, type, opts));
  };
}

export const addFieldToObjectTypeMetadata = createAddFieldFn(OBJECT_TYPE_KEY);
export const addQueryField = createAddFieldFn(OBJECT_QUERY_TYPE_KEY);
export const addMutationField = createAddFieldFn(OBJECT_MUTATION_TYPE_KEY);

export function getQueryObjectTypeMetadata(target: any): Metadata | null {
  return getObjectTypeMetadata(target, OBJECT_QUERY_TYPE_KEY);
}

export function getMutationObjectTypeMetadata(target: any): Metadata | null {
  return getObjectTypeMetadata(target, OBJECT_MUTATION_TYPE_KEY);
}

export function getObjectTypeMetadata(
  target: any,
  key: Symbol = OBJECT_TYPE_KEY
): Metadata | null {
  return Reflect.getMetadata(key, target);
}

export function getOrCreateObjectTypeMetadata(
  target: any,
  key: Symbol = OBJECT_TYPE_KEY
): Metadata | null {
  return Metadata.getOrCreateInstance(target, key);
}
