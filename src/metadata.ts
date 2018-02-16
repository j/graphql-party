import 'reflect-metadata';
import {
  isType,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLType,
  GraphQLObjectTypeConfig,
  GraphQLInputObjectTypeConfig,
} from 'graphql';
import { resolveObjectType, WrappedType } from './wrappedType';

export const OBJECT_TYPE_KEY = Symbol('ObjectType');
export const OBJECT_QUERY_TYPE_KEY = Symbol('ObjectQueryType');
export const OBJECT_MUTATION_TYPE_KEY = Symbol('ObjectMutationType');

export interface ObjectTypeFieldOpts {
  args?: { [argument: string]: GraphQLType | WrappedType | Object };
}

export interface ObjectTypeMetadata {
  name: string;
  Type: {
    new (
      config: GraphQLObjectTypeConfig<any, any> | GraphQLInputObjectTypeConfig
    ): GraphQLObjectType | GraphQLInputObjectType;
  };
  objectType: GraphQLObjectType | GraphQLInputObjectType;
  fields: { [fieldName: string]: ObjectTypeField };
}

export interface ObjectTypeField {
  getType?: () => GraphQLType;
  getArgs?: () => { [argument: string]: any };
  getResolver?: Function;
}

export function setObjectTypeMetadata(
  target,
  data: Partial<ObjectTypeMetadata>
) {
  const meta = getObjectTypeMetadata(target, true);

  meta.name = data.name || meta.name || target.name;
  meta.Type = data.Type || meta.Type;
  meta.objectType = meta.objectType || data.objectType;

  Reflect.defineMetadata(OBJECT_TYPE_KEY, meta, target);
}

function getType(type, name) {
  if (isType(type)) {
    return type;
  }

  if (type instanceof WrappedType) {
    return resolveObjectType(type, name);
  }

  const objectTypeMeta = getObjectTypeMetadata(type);

  if (!objectTypeMeta || !objectTypeMeta.objectType) {
    throw new Error(`ObjectType for ${name} is not a valid GraphQLObjectType.`);
  }

  return objectTypeMeta.objectType;
}

function getFieldOptions(fieldName, type, opts, descriptor) {
  return {
    getArgs(): { [argument: string]: any } | null {
      if (!opts || !opts.args || !Object.keys(opts.args).length) {
        return null;
      }

      let args = {};

      Object.keys(opts.args).forEach(arg => {
        args[arg] = { type: getType(opts.args[arg], arg) };
      });

      return args;
    },
    getType(): GraphQLType {
      return getType(type, fieldName);
    },
    getResolver(): Function | null {
      if (!descriptor) {
        return null;
      }

      return function(): any {
        const resolveArgs = Object.values(arguments);

        return descriptor.value.apply(resolveArgs.shift(), resolveArgs);
      };
    },
  };
}

function createAddFieldFn(key: Symbol) {
  return function(
    target,
    fieldName: string,
    type: GraphQLType | WrappedType | Object,
    opts?: ObjectTypeFieldOpts,
    descriptor?: any
  ) {
    const meta = getObjectTypeMetadata(target, true, key);

    if (typeof meta.fields[fieldName] !== 'undefined') {
      throw new Error(`Duplicate field "${fieldName}".`);
    }

    meta.fields[fieldName] = getFieldOptions(fieldName, type, opts, descriptor);

    Reflect.defineMetadata(key, meta, target);
  };
}

export const addFieldToObjectTypeMetadata = createAddFieldFn(OBJECT_TYPE_KEY);
export const addQueryField = createAddFieldFn(OBJECT_QUERY_TYPE_KEY);
export const addMutationField = createAddFieldFn(OBJECT_MUTATION_TYPE_KEY);

export function getQueryObjectTypeMetadata(
  target: any,
  withDefaults: boolean = false
): ObjectTypeMetadata | null {
  return getObjectTypeMetadata(target, withDefaults, OBJECT_QUERY_TYPE_KEY);
}

export function getMutationObjectTypeMetadata(
  target: any,
  withDefaults: boolean = false
): ObjectTypeMetadata | null {
  return getObjectTypeMetadata(target, withDefaults, OBJECT_MUTATION_TYPE_KEY);
}

export function getObjectTypeMetadata(
  target: any,
  withDefaults: boolean = false,
  key: Symbol = OBJECT_TYPE_KEY
): ObjectTypeMetadata | null {
  const meta = Reflect.getMetadata(key, target);

  if (!meta) {
    if (!withDefaults) {
      return null;
    }

    return {
      name: null,
      Type: GraphQLObjectType,
      objectType: null,
      fields: {},
    };
  }

  return {
    ...meta,
    fields: { ...meta.fields },
  };
}
