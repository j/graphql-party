import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  isInputType,
} from 'graphql';
import {
  getMutationObjectTypeMetadata,
  getObjectTypeMetadata,
  getQueryObjectTypeMetadata,
  ObjectTypeMetadata,
  GraphQLObjectOrInputTypeCtor,
  setObjectTypeMetadata,
} from '../metadata';

function getFieldsFromMeta(meta: ObjectTypeMetadata) {
  const fields = {};

  Object.keys(meta.fields).forEach(fieldName => {
    const { getArgs, getType, getResolver } = meta.fields[fieldName];

    fields[fieldName] = {
      type: getType(),
      args: getArgs(),
    };

    const resolve = getResolver();

    if (resolve) {
      fields[fieldName].resolve = resolve;
    }
  });

  return fields;
}

function createObjectOrInputType(
  ClassWithTypeMetadata: any,
  meta
): GraphQLObjectType | GraphQLInputObjectType {
  const objectType = new meta.Type({
    name: meta.name,
    fields: () => getFieldsFromMeta(meta),
  });

  setObjectTypeMetadata(ClassWithTypeMetadata, { objectType });

  return objectType;
}

/**
 * Creates a GraphQLObjectType from a given class that has @ObjectType() metadata.
 */
export function typeFromObjectTypeClass(
  ClassWithObjectTypeMetadata: any
): GraphQLObjectType {
  const meta = getObjectTypeMetadata(ClassWithObjectTypeMetadata);

  if (!meta || !meta.name) {
    throw new Error(
      `"${ClassWithObjectTypeMetadata.name}" is not a valid ObjectType.`
    );
  }

  if (meta.Type !== GraphQLObjectType) {
    throw new Error(
      `"${
        ClassWithObjectTypeMetadata.name
      }" is not a valid ObjectType ("InputType" given).`
    );
  }

  return createObjectOrInputType(
    ClassWithObjectTypeMetadata,
    meta
  ) as GraphQLObjectType;
}

/**
 * Creates a GraphQLObjectType from a given class that has @InputType() metadata.
 */
export function typeFromInputTypeClass(
  ClassWithInputTypeMetadata: any
): GraphQLInputObjectType {
  const meta = getObjectTypeMetadata(ClassWithInputTypeMetadata);

  if (!meta || !meta.name) {
    throw new Error(
      `"${ClassWithInputTypeMetadata.name}" is not a valid ObjectType.`
    );
  }

  if (meta.Type !== GraphQLInputObjectType) {
    throw new Error(
      `"${
        ClassWithInputTypeMetadata.name
      }" is not a valid InputType ("ObjectType" given).`
    );
  }

  return createObjectOrInputType(
    ClassWithInputTypeMetadata,
    meta
  ) as GraphQLInputObjectType;
}

function buildType(
  Type: GraphQLObjectOrInputTypeCtor,
  name: string,
  getMetadataFn: Function,
  classesWithMetadata: any[]
): GraphQLObjectType | GraphQLInputObjectType | null {
  let hasFields = false;
  let fields = {};

  classesWithMetadata.forEach(ClassWithMetadata => {
    const meta = getMetadataFn(ClassWithMetadata);

    if (meta) {
      hasFields = true;

      fields = {
        ...fields,
        ...getFieldsFromMeta(meta),
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
