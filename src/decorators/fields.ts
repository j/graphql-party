import * as graphql from 'graphql';
import {
  ObjectTypeMetadata,
  getObjectTypeMetadata,
  addFieldToObjectTypeMetadata,
} from '../metadata';
import { WrappedType, resolveObjectType } from '../wrappedType';

interface FieldOpts {
  name?: string;
}

export function Field(
  type: graphql.GraphQLType | WrappedType | Object,
  opts?: FieldOpts
): Function {
  return function(target: any, propertyName: string, descriptor: any): void {
    const fieldName = opts && opts.name ? opts.name : propertyName;

    addFieldToObjectTypeMetadata(
      target.constructor,
      fieldName,
      (): graphql.GraphQLType => {
        if (graphql.isType(type)) {
          return type;
        }

        if (type instanceof WrappedType) {
          return resolveObjectType(type, fieldName);
        }

        const objectType = getObjectTypeMetadata(type).objectType;

        if (!objectType) {
          throw new Error(
            `ObjectType for ${fieldName} is not a valid GraphQLObjectType.`
          );
        }

        return objectType;
      }
    );
  };
}
