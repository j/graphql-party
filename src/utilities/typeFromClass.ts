import { GraphQLObjectType, GraphQLInputObjectType, isType } from 'graphql';
import {
  getMutationObjectTypeMetadata,
  getObjectTypeMetadata,
  getQueryObjectTypeMetadata,
  Metadata,
  GraphQLObjectOrInputTypeCtor,
} from '../metadata';

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
  getMetadataFn: () => Metadata,
  classesWithMetadata: any[]
): GraphQLObjectType | GraphQLInputObjectType | null {
  let hasFields = false;
  let fields = {};

  classesWithMetadata.forEach(ClassWithMetadataOrArray => {
    let ClassWithMetadata = ClassWithMetadataOrArray;
    let args = [];

    if (Array.isArray(ClassWithMetadataOrArray)) {
      ClassWithMetadata = ClassWithMetadataOrArray[0];
      args = ClassWithMetadataOrArray[1];
    }

    const meta = getMetadataFn(ClassWithMetadata);

    if (meta) {
      if (args.length) {
        meta.setTargetInstanceAgs(args);
      }

      hasFields = true;

      fields = {
        ...fields,
        ...meta.computeFields(),
      };
    }
  });

  if (!hasFields) {
    return null;
  }

  return new Type({ name, fields: fields });
}

/**
 * Creates a GraphQLObjectType with name "Query" from given classes that contain
 * @Query() metadata.
 */
export function typeFromClassWithQueries(
  classesWithObjectMetadata: any[]
): GraphQLObjectType | null {
  return buildType(
    GraphQLObjectType,
    'Query',
    getQueryObjectTypeMetadata,
    classesWithObjectMetadata
  ) as GraphQLObjectType | null;
}

/**
 * Creates a GraphQLObjectType with name "Mutation" from given classes that contain
 * @Mutation() metadata.
 */
export function typeFromClassWithMutations(
  classesWithMutationMetadata: any[]
): GraphQLObjectType | null {
  return buildType(
    GraphQLObjectType,
    'Mutation',
    getMutationObjectTypeMetadata,
    classesWithMutationMetadata
  ) as GraphQLObjectType | null;
}
