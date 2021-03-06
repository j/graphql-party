import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import dedent from 'graphql/jsutils/dedent';
import {
  typeFromObjectTypeClass,
  typeFromInputTypeClass,
  Types,
  ObjectType,
  InputType,
  Field,
} from '../../src';
import {
  typeFromClassWithQueries,
  typeFromClassWithMutations,
} from '../../src/utilities/typeFromClass';
import {
  AllTheThings,
  AllTheThingsChild,
  expectedTypes,
} from '../fixtures/allTheThings';

describe('typeFromClass.ts', () => {
  describe('typeFromObjectTypeClass()', () => {
    it('builds decorated "AllTheThings" and "AllTheThingsChild"', () => {
      const allTheThingsType = typeFromObjectTypeClass(AllTheThings);

      // Register the Post field
      const postType = typeFromObjectTypeClass(AllTheThingsChild);

      assert.equal(
        graphql.printType(allTheThingsType),
        expectedTypes.AllTheThings
      );
      assert.equal(
        graphql.printType(postType),
        expectedTypes.AllTheThingsChild
      );
    });

    it('errors when types are not valid', () => {
      class Article {}
      assert.throw(
        () => typeFromObjectTypeClass(Article),
        `"Article" is not a valid ObjectType.`
      );
    });

    it('errors when @InputType() is given', () => {
      @InputType()
      class ArticleInput {}

      assert.throw(
        () => typeFromObjectTypeClass(ArticleInput),
        `"ArticleInput" is not a valid ObjectType ("InputType" given).`
      );
    });
  });

  describe('typeFromInputTypeClass()', () => {
    @InputType()
    class AnimalInput {
      @Field(Types.String) public name: string;
    }

    it('builds a valid @InputType()', () => {
      const animalInput = typeFromInputTypeClass(AnimalInput);

      assert.equal(
        graphql.printType(animalInput),
        dedent`
        input AnimalInput {
          name: String
        }`
      );
    });

    it('errors when @ObjectType() is given', () => {
      @ObjectType()
      class Article {}

      assert.throw(
        () => typeFromInputTypeClass(Article),
        `"Article" is not a valid InputType ("ObjectType" given).`
      );
    });
  });

  describe('typeFromClassWithQueries()', () => {
    it('builds a valid GraphQLObjectType with name "Query"', () => {
      const query = typeFromClassWithQueries([AllTheThings]);

      assert.equal(graphql.printType(query), expectedTypes.Query);
    });
  });

  describe('typeFromClassWithMutations()', () => {
    it('builds a valid GraphQLObjectType with name "Mutation"', () => {
      const mutation = typeFromClassWithMutations([AllTheThings]);

      assert.equal(graphql.printType(mutation), expectedTypes.Mutation);
    });
  });
});
