import 'reflect-metadata';
import { GraphQLType } from 'graphql';
import { WrappedType } from '../utilities/wrappedType';
import { MetadataField, MetadataFieldOpts } from './metadataField';
import { Metadata, MetadataParam } from './metadata';

export { MetadataField } from './metadataField';
export { Metadata, GraphQLObjectOrInputTypeCtor } from './metadata';

export const OBJECT_TYPE_KEY = Symbol('@ObjectType');
export const OBJECT_QUERY_TYPE_KEY = Symbol('@Query');
export const OBJECT_MUTATION_TYPE_KEY = Symbol('@Mutation');
export const PARAM_METADATA_KEY = Symbol('ParamMetadata');

function createAddFieldFn(key: Symbol) {
  return function(
    target,
    fieldName: string,
    type: GraphQLType | WrappedType | Object,
    opts?: MetadataFieldOpts
  ) {
    const meta = Metadata.getOrCreateInstance(
      opts && opts.isStaticFunction ? target : target.constructor,
      key
    );

    if (meta.hasField(fieldName)) {
      throw new Error(`Duplicate field "${fieldName}".`);
    }

    meta.addField(
      new MetadataField(
        fieldName,
        type,
        opts,
        getFieldParamMetadata(target, fieldName)
      )
    );
  };
}

export const addFieldToObjectTypeMetadata = createAddFieldFn(OBJECT_TYPE_KEY);
export const addQueryField = createAddFieldFn(OBJECT_QUERY_TYPE_KEY);
export const addMutationField = createAddFieldFn(OBJECT_MUTATION_TYPE_KEY);

export function addFieldParamMetadata(
  target,
  methodName: string,
  param: MetadataParam
) {
  const params = getFieldParamMetadata(target, methodName) || [];

  params.push(param);

  Reflect.defineMetadata(PARAM_METADATA_KEY, params, target, methodName);
}

export function getFieldParamMetadata(target, methodName: string) {
  return Reflect.getMetadata(PARAM_METADATA_KEY, target, methodName) || [];
}

export function getQueryObjectTypeMetadata(target: any): Metadata | undefined {
  return getObjectTypeMetadata(target, OBJECT_QUERY_TYPE_KEY);
}

export function getMutationObjectTypeMetadata(
  target: any
): Metadata | undefined {
  return getObjectTypeMetadata(target, OBJECT_MUTATION_TYPE_KEY);
}

export function getObjectTypeMetadata(
  target: any,
  key: Symbol = OBJECT_TYPE_KEY
): Metadata | undefined {
  return Reflect.getMetadata(key, target);
}

export function getOrCreateObjectTypeMetadata(
  target: any,
  key: Symbol = OBJECT_TYPE_KEY
): Metadata | undefined {
  return Metadata.getOrCreateInstance(target, key);
}
