import {
  GraphQLList,
  GraphQLNonNull,
  // @ts-ignore
  isListType,
  // @ts-ignore
  isNonNullType,
  // @ts-ignore
  isScalarType,
} from 'graphql';
import { getObjectTypeMetadata } from '../metadata';
import { WrappedType } from './wrappedType';

function deserializeWrappedType(WrappedType, data, config) {
  if (WrappedType.TypeConstructor === GraphQLList) {
    if (!Array.isArray(data)) {
      return;
    }

    return data.map(item => deserialize(WrappedType.ofType, item, config));
  }

  if (WrappedType.TypeConstructor === GraphQLNonNull) {
    return deserialize(WrappedType.ofType, data, config);
  }

  return;
}

export interface DeserializeConfig {
  types?: { type: any; parseValue: (data: any) => any }[];
  parseValues?: boolean;
}

// When "parseValue" is false, the data will be set to the field as is.  This is good for use-cases
// such as pulling data from a DB.
export function deserialize(
  Type: any,
  data: any,
  configOrParseValues: DeserializeConfig | boolean
) {
  let config: DeserializeConfig = {};

  if (typeof configOrParseValues === 'object') {
    config = configOrParseValues;
  } else if (
    typeof configOrParseValues !== 'undefined' &&
    !configOrParseValues
  ) {
    config = { parseValues: false };
  }

  if (Type instanceof WrappedType) {
    return deserializeWrappedType(Type, data, config);
  }

  // @ts-ignore
  if (isNonNullType(Type)) {
    return deserialize(Type.ofType, data, config);
  }

  // @ts-ignore
  if (isListType(Type)) {
    if (!Array.isArray(data)) {
      return;
    }

    return data.map(item => deserialize(Type.ofType, item, config));
  }

  // @ts-ignore
  if (isScalarType(Type)) {
    if (config && config.types) {
      for (let i = 0; i < config.types.length; i++) {
        if (config.types[i].type === Type) {
          return config.types[i].parseValue(data);
        }
      }
    }

    if (
      config &&
      typeof config.parseValues !== 'undefined' &&
      !config.parseValues
    ) {
      return data;
    }

    return Type.parseValue(data);
  }

  const meta = getObjectTypeMetadata(Type);

  if (!meta) {
    return data;
  }

  const obj = new Type();

  Object.values(meta.getFields()).forEach(({ opts, type }) => {
    const propertyName = opts.propertyOrMethodName;

    if (typeof data[propertyName] !== 'undefined') {
      obj[propertyName] = deserialize(type, data[propertyName], config);
    }
  });

  return obj;
}
