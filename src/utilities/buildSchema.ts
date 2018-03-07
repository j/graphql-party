import { GraphQLSchema } from 'graphql';
import * as path from 'path';
import * as globby from 'globby';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import {
  getMutationObjectTypeMetadata,
  getObjectTypeMetadata,
  getQueryObjectTypeMetadata,
  OBJECT_TYPE_KEY,
  OBJECT_QUERY_TYPE_KEY,
  OBJECT_MUTATION_TYPE_KEY,
} from '../metadata';
import {
  typeFromObjectTypeClass,
  typeFromInputTypeClass,
  typeFromClassWithMutations,
  typeFromClassWithQueries,
} from './typeFromClass';

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
