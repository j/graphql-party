import 'mocha';
import { assert } from 'chai';
import { ObjectType, Field, Types } from '../../src';
import {
  ClassMetadata,
  CLASS_METADATA_KEY,
} from '../../src/mapping/ClassMetadata';
import { GraphQLObjectType } from 'graphql';
import { Metadata } from '../../src/metadata/metadata';

describe('@ObjectType()', () => {
  it('decorates', () => {
    @ObjectType()
    class Article {}
    const metadata = Reflect.getMetadata(CLASS_METADATA_KEY, Article);

    assert.instanceOf(metadata, ClassMetadata);
    assert.equal(metadata.target, Article);
    assert.isEmpty(metadata.fields);
    assert.equal(metadata.name, 'Article');
  });

  it('decorates with name', () => {
    @ObjectType({ name: 'Article' })
    class ArticleModel {}

    const metadata = Reflect.getMetadata(CLASS_METADATA_KEY, ArticleModel);

    assert.instanceOf(metadata, ClassMetadata);
    assert.equal(metadata.target, ArticleModel);
    assert.isEmpty(metadata.fields);
    assert.equal(metadata.name, 'Article');
  });
});
