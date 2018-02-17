import * as graphql from 'graphql';
import { getObjectTypeMetadata } from './utilities/metadata';

type TypeConstructorReturnType = graphql.GraphQLType;

function create(
  wrappedType: WrappedType,
  objectType: graphql.GraphQLType,
  fieldName: string
): TypeConstructorReturnType {
  if (!graphql.isType(objectType)) {
    throw new Error(
      `"objectType" is not a valid GraphQLType or @ObjectType() for field "${fieldName}".`
    );
  }

  return new wrappedType.TypeConstructor(objectType);
}

export function resolveObjectType(
  type: WrappedType,
  fieldName: string
): TypeConstructorReturnType {
  if (type.ofType instanceof WrappedType) {
    return create(type, resolveObjectType(type.ofType, fieldName), fieldName);
  }

  if (graphql.isType(type.ofType)) {
    return create(type, type.ofType, fieldName);
  }

  return create(
    type,
    getObjectTypeMetadata(type.ofType, true).objectType,
    fieldName
  );
}

export class WrappedType {
  constructor(
    public TypeConstructor: {
      new (type: graphql.GraphQLType): TypeConstructorReturnType;
    },
    public ofType: any
  ) {}
}
