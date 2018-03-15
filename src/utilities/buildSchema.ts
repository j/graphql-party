import { GraphQLObjectType, GraphQLSchema, GraphQLType } from 'graphql';
import * as path from 'path';
import * as globby from 'globby';
import { factories } from '../mapping';
import { ClassMetadata } from '../mapping/ClassMetadata';

function isClass(target) {
  return (
    typeof target === 'function' || typeof target.prototype !== 'undefined'
  );
}

function loadPotentialTargets(
  classesOrGlobs: any[] | any,
  config: { cwd: string } = { cwd: process.cwd() }
) {
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

  return potentialTargets;
}

function createType(name: string, allMetadata): GraphQLObjectType {
  if (!allMetadata.length) {
    return;
  }

  const fields = {};

  allMetadata.forEach(metadata => {
    Object.keys(metadata.graphqlFields).forEach(fieldName => {
      if (typeof fields[fieldName] !== 'undefined') {
        throw new Error(`Field with name "${fieldName}" already exists.`);
      }

      fields[fieldName] = metadata.graphqlFields[fieldName];
    });
  });

  return new GraphQLObjectType({
    name,
    fields: () => fields,
  });
}

export function buildSchema(
  classesOrGlobs: any[] | any,
  config: { cwd: string } = { cwd: process.cwd() }
): GraphQLSchema {
  const allQueryMetadata: ClassMetadata[] = [];
  const allMutationMetadata: ClassMetadata[] = [];

  const potentialTargets = loadPotentialTargets(classesOrGlobs, config);

  potentialTargets.forEach(target => {
    // process standard object types
    factories.objectType.loadMetadataFor(target);

    // process query metadata
    const queryMetadata = factories.query.loadMetadataFor(target);
    if (queryMetadata) {
      allQueryMetadata.push(queryMetadata);
    }

    // process mutation metadata
    const mutationMetadata = factories.mutation.loadMetadataFor(target);
    if (mutationMetadata) {
      allMutationMetadata.push(mutationMetadata);
    }
  });

  return new GraphQLSchema({
    query: createType('Query', allQueryMetadata),
    mutation: createType('Mutation', allMutationMetadata),
  });
}
