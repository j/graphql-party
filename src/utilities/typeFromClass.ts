import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  isType,
  GraphQLSchema,
} from 'graphql';
import { sync as requireGlobSync } from 'require-glob';
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

function assertValidTarget(
  target: any,
  {
    isObjectType,
    isQuery,
    isMutation,
  }: { isObjectType: boolean; isQuery: boolean; isMutation: boolean }
) {
  // @Query and @Mutation within an @ObjectType must be static methods.
  if (isObjectType && (isQuery || isMutation)) {
    const objectMeta = getObjectTypeMetadata(target);
    const queryMeta = getQueryObjectTypeMetadata(target);
    const mutationMeta = getMutationObjectTypeMetadata(target);

    const fields = Object.values({
      ...(queryMeta ? queryMeta.getFields() : {}),
      ...(mutationMeta ? mutationMeta.getFields() : {}),
    });

    const invalidFields = [];

    fields.forEach(field => {
      if (!field.isResolverStaticFunction()) {
        invalidFields.push(field.getOpts().propertyOrMethodName);
      }
    });

    if (invalidFields.length) {
      throw new Error(
        `Fields "${invalidFields.join(
          '", "'
        )}" must be static if they belong to an @ObjectType.`
      );
    }
  }
}

function isClass(target) {
  return (
    typeof target === 'function' || typeof target.prototype !== 'undefined'
  );
}

function isPotentialTarget(
  target
): {
  isObjectType: boolean;
  isQuery: boolean;
  isMutation: boolean;
  isPotential: boolean;
} {
  const keys = Reflect.getOwnMetadataKeys(target);

  const isObjectType = keys.includes(OBJECT_TYPE_KEY);
  const isQuery = keys.includes(OBJECT_QUERY_TYPE_KEY);
  const isMutation = keys.includes(OBJECT_MUTATION_TYPE_KEY);

  let isPotential = true;

  if (!isObjectType && !isQuery && !isMutation) {
    isPotential = false;
  }

  return { isObjectType, isQuery, isMutation, isPotential };
}

export function buildSchema(
  classesOrGlobs: any[] | any,
  config: { cwd: string } = { cwd: process.cwd() }
): GraphQLSchema {
  const queryObjects = [];
  const mutationObjects = [];

  const potentialTargets = [];
  const globs = [];

  if (!Array.isArray(classesOrGlobs)) {
    classesOrGlobs = [classesOrGlobs];
  }

  classesOrGlobs.forEach(target => {
    if (typeof target === 'string') {
      globs.push(target);

      return;
    }

    if (isClass(target)) {
      potentialTargets.push(target);
    }
  });

  if (globs.length) {
    const files = globby.sync(globs.map(glob => path.join(config.cwd, glob)));

    files.forEach(file => {
      const module = require(file);

      Object.values(module).forEach(target => {
        if (isClass(target)) {
          potentialTargets.push(target);
        }
      });
    });
  }

  potentialTargets.forEach(target => {
    const {
      isObjectType,
      isQuery,
      isMutation,
      isPotential,
    } = isPotentialTarget(target);

    // skip invalid target types
    if (!isPotential) {
      return;
    }

    // validate potentials
    assertValidTarget(target, { isObjectType, isQuery, isMutation });

    const knownMetas = Reflect.getOwnMetadataKeys(target);

    knownMetas.forEach(key => {
      switch (key) {
        case OBJECT_TYPE_KEY:
          const meta = getObjectTypeMetadata(target);

          if (meta.isInputType()) {
            typeFromInputTypeClass(target);
          } else {
            typeFromObjectTypeClass(target);
          }
          break;
        case OBJECT_QUERY_TYPE_KEY:
          queryObjects.push(target);
          break;
        case OBJECT_MUTATION_TYPE_KEY:
          mutationObjects.push(target);
          break;
      }
    });
  });

  return new GraphQLSchema({
    query: typeFromClassWithQueries(queryObjects),
    mutation: typeFromClassWithMutations(mutationObjects),
  });
}
