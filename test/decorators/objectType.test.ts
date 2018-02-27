import 'mocha';
import { assert } from 'chai';
import { ObjectType } from '../../src';
import { OBJECT_TYPE_KEY } from '../../src/metadata/index';
import { GraphQLObjectType } from 'graphql';
import { Metadata } from '../../src/metadata/metadata';

describe('@ObjectType()', () => {
  it('decorates', () => {
    @ObjectType()
    class Article {}

    const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, Article);

    assert.instanceOf(metadata, Metadata);
    assert.equal(metadata.getTarget(), Article);
    assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
    assert.equal(metadata.getType(), GraphQLObjectType);
    assert.isEmpty(metadata.getFields());
    assert.equal(metadata.getName(), 'Article');
    assert.isUndefined(metadata.getObjectType());
  });

  it('decorates with name', () => {
    @ObjectType({ name: 'Article' })
    class ArticleModel {}

    const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, ArticleModel);

    assert.instanceOf(metadata, Metadata);
    assert.equal(metadata.getTarget(), ArticleModel);
    assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
    assert.equal(metadata.getType(), GraphQLObjectType);
    assert.isEmpty(metadata.getFields());
    assert.equal(metadata.getName(), 'Article');
    assert.isUndefined(metadata.getObjectType());
  });
});
