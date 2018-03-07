import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import { buildSchema } from '../../src';
import {
  InvalidObjectTypeWithQueries,
  InvalidObjectTypeWithMutations,
} from '../fixtures/invalidTypes';
import {
  User,
  UserQueries,
  UserMutations,
  UserInput,
  expectedUserSchema,
} from '../fixtures/user';

describe('assertValidTarget()', () => {
  it('errors when @ObjectType contains @Query fields that are not static', () => {
    assert.throws(
      // ts-ignore
      () => buildSchema(InvalidObjectTypeWithQueries),
      'Fields "invalidQuery1", "invalidQuery2" must be static if they belong to an @ObjectType.'
    );
  });

  it('errors when @ObjectType contains @Mutation fields that are not static', () => {
    assert.throws(
      // ts-ignore
      () => buildSchema(InvalidObjectTypeWithMutations),
      'Fields "invalidMutation1", "invalidMutation2" must be static if they belong to an @ObjectType.'
    );
  });
});

describe('buildSchema()', () => {
  it('creates a schema using arrays', () => {
    const schema = buildSchema([User, UserQueries, UserMutations, UserInput]);

    assert.equal(graphql.printSchema(schema), expectedUserSchema);
  });

  it('creates a schema from a single glob', () => {
    const schema = buildSchema(`./test/fixtures/user.ts`);

    assert.equal(graphql.printSchema(schema), expectedUserSchema);
  });

  it('fails on invalid classes', () => {
    assert.throws(() => {
      buildSchema([User, UserQueries, InvalidObjectTypeWithMutations]);
    }, 'Fields "invalidMutation1", "invalidMutation2" must be static if they belong to an @ObjectType.');
  });
});
