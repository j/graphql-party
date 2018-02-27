import 'mocha';
import { assert } from 'chai';
import { Query, Types } from '../../src';
import { OBJECT_QUERY_TYPE_KEY } from '../../src/metadata/index';
import { GraphQLObjectType } from 'graphql';
import { Metadata } from '../../src/metadata/metadata';
import { MetadataField } from '../../src/metadata/metadataField';

describe('@Query()', () => {
  const tests = [
    { type: Types.String, name: undefined },
    { type: Types.Int, name: 'findTitle' },
  ];

  tests.forEach(({ type, name }) => {
    const description = [
      `type is "${type}"`,
      `name is ${name ? 'defined' : 'undefined'}`,
    ];

    it(`creates @Query when ${description.join(' and ')}`, () => {
      class ArticleRepository {
        @Query(type, { name })
        static findTitleForArticle(): any {
          return 'some title';
        }
      }

      const fieldName = name || 'findTitleForArticle';

      const metadata = Reflect.getMetadata(
        OBJECT_QUERY_TYPE_KEY,
        ArticleRepository
      );

      assert.instanceOf(metadata, Metadata);
      assert.equal(metadata.getTarget(), ArticleRepository);
      assert.equal(metadata.getKey(), OBJECT_QUERY_TYPE_KEY);
      assert.equal(metadata.getType(), GraphQLObjectType);
      assert.hasAllKeys(metadata.getFields(), [fieldName]);

      // name is always undefined for Queries/Mutations
      assert.isUndefined(metadata.getName());
      assert.isUndefined(metadata.getObjectType());

      const findField = metadata.getFields()[fieldName];

      assert.instanceOf(findField, MetadataField);
      assert.equal(findField.getFieldName(), fieldName);
      assert.equal(findField.getType(), type);

      const opts = findField.getOpts();
      assert.equal(opts.methodName, 'findTitleForArticle');
    });
  });

  it('throws error when no type is given', () => {
    assert.throws(() => {
      class ArticleRepository {
        // @ts-ignore
        @Query()
        findTitleForArticle(): any {
          return 'some title';
        }
      }
    }, 'Query is missing a type.');
  });
});
