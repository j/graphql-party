import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLSchema,
} from 'graphql';
import * as path from 'path';
import * as globby from 'globby';
import {
  getMutationObjectTypeMetadata,
  getObjectTypeMetadata,
  getQueryObjectTypeMetadata,
  Metadata,
  GraphQLObjectOrInputTypeCtor,
  OBJECT_TYPE_KEY,
  OBJECT_QUERY_TYPE_KEY,
  OBJECT_MUTATION_TYPE_KEY,
} from '../metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';

function createObjectOrInputType(
  meta: Metadata
): GraphQLObjectType | GraphQLInputObjectType {
  return meta.createType(() => meta.computeFields());
}

/**
 * Creates a GraphQLObjectType from a given class that has @ObjectType() metadata.
 */
export function typeFromObjectTypeClass(
  ClassWithObjectTypeMetadata: any
): GraphQLObjectType {
  const meta = getObjectTypeMetadata(ClassWithObjectTypeMetadata);

  if (!meta || !meta.getName()) {
    throw new Error(
      `"${ClassWithObjectTypeMetadata.name}" is not a valid ObjectType.`
    );
  }

  if (meta.getType() !== GraphQLObjectType) {
    throw new Error(
      `"${
        ClassWithObjectTypeMetadata.name
      }" is not a valid ObjectType ("InputType" given).`
    );
  }

  return createObjectOrInputType(meta) as GraphQLObjectType;
}

/**
 * Creates a GraphQLObjectType from a given class that has @InputType() metadata.
 */
export function typeFromInputTypeClass(
  ClassWithInputTypeMetadata: any
): GraphQLInputObjectType {
  const meta = getObjectTypeMetadata(ClassWithInputTypeMetadata);

  if (!meta || !meta.getName()) {
    throw new Error(
      `"${ClassWithInputTypeMetadata.name}" is not a valid ObjectType.`
    );
  }

  if (meta.getType() !== GraphQLInputObjectType) {
    throw new Error(
      `"${
        ClassWithInputTypeMetadata.name
      }" is not a valid InputType ("ObjectType" given).`
    );
  }

  return createObjectOrInputType(meta) as GraphQLInputObjectType;
}

function buildType(
  Type: GraphQLObjectOrInputTypeCtor,
  name: string,
  getMetadataFn: (Class: any) => Metadata,
  classesWithMetadata: any[]
): GraphQLObjectType | GraphQLInputObjectType | undefined {
  let hasFields = false;
  let fields = {};

  classesWithMetadata.forEach(ClassWithMetadata => {
    const meta = getMetadataFn(ClassWithMetadata);

    if (meta) {
      hasFields = true;

      fields = {
        ...fields,
        ...meta.computeFields(),
      };
    }
  });

  if (!hasFields) {
    return;
  }

  return new Type({ name, fields: fields });
}

/**
 * Creates a GraphQLObjectType with name "Query" from given classes that contain
 * @Query() metadata.
 */
export function typeFromClassWithQueries(
  classesWithObjectMetadata: any[]
): GraphQLObjectType | undefined {
  return buildType(
    GraphQLObjectType,
    'Query',
    getQueryObjectTypeMetadata,
    classesWithObjectMetadata
  ) as GraphQLObjectType | undefined;
}

/**
 * Creates a GraphQLObjectType with name "Mutation" from given classes that contain
 * @Mutation() metadata.
 */
export function typeFromClassWithMutations(
  classesWithMutationMetadata: any[]
): GraphQLObjectType | undefined {
  return buildType(
    GraphQLObjectType,
    'Mutation',
    getMutationObjectTypeMetadata,
    classesWithMutationMetadata
  ) as GraphQLObjectType | undefined;
}
