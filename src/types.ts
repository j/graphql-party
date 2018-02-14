import * as graphql from 'graphql';
import { WrappedType } from './wrappedType';

export const Int = graphql.GraphQLInt;
export const Float = graphql.GraphQLFloat;
export const String = graphql.GraphQLString;
export const Boolean = graphql.GraphQLBoolean;
export const ID = graphql.GraphQLID;

export function List(
  type: graphql.GraphQLType | WrappedType | Object
): graphql.GraphQLList<graphql.GraphQLType> | WrappedType {
  // @ts-ignore
  if (graphql.isType(type) && !graphql.isListType(type)) {
    return new graphql.GraphQLList(type);
  }

  return new WrappedType(graphql.GraphQLList, type);
}

export function NonNullable(
  type: graphql.GraphQLNullableType | WrappedType | Object
): graphql.GraphQLNonNull<graphql.GraphQLNullableType> | WrappedType {
  // @ts-ignore
  if (graphql.isNullableType(type)) {
    return new graphql.GraphQLNonNull(type as graphql.GraphQLNullableType);
  }

  return new WrappedType(graphql.GraphQLNonNull, type);
}
