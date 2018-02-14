import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import * as metadata from '../src/metadata';

describe('addFieldToObjectTypeMetadata()', () => {
  it('Errors when there is a duplicate field', () => {
    class Animal {
      public name: string;
    }

    metadata.addFieldToObjectTypeMetadata(
      Animal,
      'name',
      (): graphql.GraphQLType => {
        return graphql.GraphQLString;
      }
    );

    assert.throw(() =>
      metadata.addFieldToObjectTypeMetadata(
        Animal,
        'name',
        (): graphql.GraphQLType => {
          return graphql.GraphQLInt;
        }
      )
    );
  });
});
