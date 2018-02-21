import * as graphql from 'graphql';
import { Metadata } from '../metadata';

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

export function resolveWrappedType(
  type: WrappedType,
  fieldName: string
): TypeConstructorReturnType {
  if (type.ofType instanceof WrappedType) {
    return create(type, resolveWrappedType(type.ofType, fieldName), fieldName);
  }

  if (graphql.isType(type.ofType)) {
    return create(type, type.ofType, fieldName);
  }

  return create(
    type,
    Metadata.getOrCreateInstance(type.ofType).objectType,
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
