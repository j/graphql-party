import 'reflect-metadata';
import * as graphql from 'graphql';

const OBJECT_TYPE_KEY = Symbol('ObjectType');

export interface ObjectTypeMetadata {
  name: string;
  objectType: graphql.GraphQLObjectType;
  fields: { [fieldName: string]: ObjectTypeField };
}

interface ObjectTypeFieldArg {
  key: string;
  value: string;
}

export interface ObjectTypeField {
  typeFn?: () => graphql.GraphQLType;
  argsFn?: () => ObjectTypeFieldArg[];
  resolve?: () => Function;
}

export function setObjectTypeMetadata(
  target,
  data: Partial<ObjectTypeMetadata>
) {
  const meta = getObjectTypeMetadata(target, true);

  meta.name = meta.name || data.name || target.name;
  meta.objectType = meta.objectType || data.objectType;

  Reflect.defineMetadata(OBJECT_TYPE_KEY, meta, target);
}

export function addFieldToObjectTypeMetadata(
  target,
  fieldName: string,
  typeFn: () => graphql.GraphQLType
) {
  const meta = getObjectTypeMetadata(target, true);

  if (typeof meta.fields[fieldName] !== 'undefined') {
    throw new Error(`Duplicate field "${fieldName}".`);
  }

  meta.fields[fieldName] = { typeFn };

  Reflect.defineMetadata(OBJECT_TYPE_KEY, meta, target);
}

export function getObjectTypeMetadata(
  target: any,
  withDefaults: boolean = false
): ObjectTypeMetadata | null {
  const meta = Reflect.getMetadata(OBJECT_TYPE_KEY, target);

  if (!meta) {
    if (!withDefaults) {
      return null;
    }

    return {
      name: null,
      objectType: null,
      fields: {},
    };
  }

  return {
    ...meta,
    fields: { ...meta.fields },
  };
}
