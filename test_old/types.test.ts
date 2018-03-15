import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import * as types from '../src/types';

describe('default GraphQL Scalar types', () => {
  const tests = [
    { name: 'Int', expected: graphql.GraphQLInt },
    { name: 'Float', expected: graphql.GraphQLFloat },
    { name: 'String', expected: graphql.GraphQLString },
    { name: 'Boolean', expected: graphql.GraphQLBoolean },
    { name: 'ID', expected: graphql.GraphQLID },
  ];

  tests.forEach(({ name, expected }) => {
    it(`maps "${name}" to "GraphQL${name}"`, () => {
      const type = types[name];

      assert.equal(type, expected);
      assert.equal(type.toString(), name);
    });
  });
});

describe('Types.List()', () => {
  const tests = [
    { name: 'Int', expected: graphql.GraphQLInt },
    { name: 'Float', expected: graphql.GraphQLFloat },
    { name: 'String', expected: graphql.GraphQLString },
    { name: 'Boolean', expected: graphql.GraphQLBoolean },
    { name: 'ID', expected: graphql.GraphQLID },
  ];

  tests.forEach(({ name, expected }) => {
    it(`creates list of "GraphQL${name}"`, () => {
      const type = types.List(types[name]);

      assert.instanceOf(type, graphql.GraphQLList);
      assert.equal(type.ofType, expected);
      assert.equal(type.toString(), `[${name}]`);
    });
  });
});

describe('Types.NonNullable()', () => {
  const tests = [
    { name: 'Int', expected: graphql.GraphQLInt },
    { name: 'Float', expected: graphql.GraphQLFloat },
    { name: 'String', expected: graphql.GraphQLString },
    { name: 'Boolean', expected: graphql.GraphQLBoolean },
    { name: 'ID', expected: graphql.GraphQLID },
  ];

  tests.forEach(({ name, expected }) => {
    it(`creates non-nullable "${name}" of "GraphQL${name}"`, () => {
      const type = types.NonNullable(types[name]) as graphql.GraphQLNonNull<
        graphql.GraphQLNullableType
      >;

      assert.instanceOf(type, graphql.GraphQLNonNull);
      assert.equal(type.ofType, expected);
      assert.equal(type.toString(), `${name}!`);
    });
  });

  tests.forEach(({ name, expected }) => {
    it(`creates non-nullable lists of "GraphQL${name}"`, () => {
      const type = types.NonNullable(
        types.List(types[name])
      ) as graphql.GraphQLNonNull<graphql.GraphQLList<any>>;

      assert.instanceOf(type, graphql.GraphQLNonNull);
      assert.instanceOf(type.ofType, graphql.GraphQLList);
      assert.equal(type.ofType.ofType, expected);
      assert.equal(type.toString(), `[${name}]!`);
    });
  });

  tests.forEach(({ name, expected }) => {
    it(`creates lists of non-nullable "GraphQL${name}"`, () => {
      const type = types.List(
        types.NonNullable(types[name])
      ) as graphql.GraphQLNonNull<graphql.GraphQLList<any>>;

      assert.instanceOf(type, graphql.GraphQLList);
      assert.instanceOf(type.ofType, graphql.GraphQLNonNull);
      assert.equal(type.ofType.ofType, expected);
      assert.equal(type.toString(), `[${name}!]`);
    });
  });
});
