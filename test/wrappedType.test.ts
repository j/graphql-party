import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import { WrappedType, resolveWrappedType } from '../src/utilities/wrappedType';
import { getOrCreateObjectTypeMetadata } from '../src/metadata';

describe('resolveWrappedType()', () => {
  const wrappedTypeConstructor = [graphql.GraphQLList, graphql.GraphQLNonNull];

  const userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
      name: { type: graphql.GraphQLString },
    },
  });

  class User {}
  const meta = getOrCreateObjectTypeMetadata(User);
  meta.setName('User');
  meta.setObjectType(userType);

  const tests = [
    { type: graphql.GraphQLInt },
    { type: graphql.GraphQLFloat },
    { type: graphql.GraphQLString },
    { type: graphql.GraphQLBoolean },
    { type: graphql.GraphQLID },
    { type: userType }, // test an already defined GraphQLObjectType
    { type: User, asType: userType, isFromMetadata: true }, // test object with defined metadata
  ];

  wrappedTypeConstructor.forEach(
    (TypeConstructor: {
      new (type: graphql.GraphQLType): graphql.GraphQLType;
    }) => {
      tests.forEach(({ type, asType, isFromMetadata }) => {
        it(`resolves WrappedType(${TypeConstructor.name}, ${type.name})${
          isFromMetadata ? ' from metadata' : ''
        }`, () => {
          const wrappedType = new WrappedType(TypeConstructor, type);
          const expectedType = new TypeConstructor((isFromMetadata
            ? asType
            : type) as graphql.GraphQLType);

          assert.equal(
            resolveWrappedType(wrappedType, 'foo').toString(),
            expectedType.toString()
          );
        });
      });
    }
  );

  const invalidTests = [
    { name: 'String', type: String },
    { name: 'Number', type: Number },
    { name: 'Date', type: Date },
    { name: 'Array', type: [] },
    { name: 'Object', type: Object },
    { name: 'UnmappedUser', type: class UnmappedUser {} },
  ];

  invalidTests.forEach(({ type, name }) => {
    it(`errors when given an invalid type "${name}"`, () => {
      assert.throw(
        () =>
          resolveWrappedType(
            new WrappedType(graphql.GraphQLList, type),
            'someField'
          ),
        '"objectType" is not a valid GraphQLType or @ObjectType() for field "someField".'
      );
    });
  });
});
