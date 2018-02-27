import 'mocha';
import { assert } from 'chai';
import { ObjectType, FieldResolver, Types } from '../../src';
import { OBJECT_TYPE_KEY } from '../../src/metadata/index';
import { GraphQLList, GraphQLObjectType } from 'graphql';
import { Metadata } from '../../src/metadata/metadata';
import { WrappedType } from '../../src/utilities/wrappedType';

describe('@FieldResolver()', () => {
  it('decorates', () => {
    @ObjectType()
    class Article {}

    @ObjectType()
    class Comment {}

    class ArticleRepository {
      @FieldResolver(Article, Types.List(Comment))
      async comments(): Promise<Comment[]> {
        return new Promise<Comment[]>(resolve => resolve([new Comment()]));
      }
    }

    const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, Article);

    assert.instanceOf(metadata, Metadata);
    assert.equal(metadata.getTarget(), Article);
    assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
    assert.equal(metadata.getType(), GraphQLObjectType);
    assert.equal(metadata.getName(), 'Article');
    assert.isUndefined(metadata.getObjectType());

    assert.lengthOf(Object.values(metadata.getFields()), 1);

    const field = metadata.getField('comments');

    assert.equal(field.getFieldName(), 'comments');
    assert.instanceOf(field.getType(), WrappedType);
    assert.equal(field.getType().TypeConstructor, GraphQLList);
    assert.equal(field.getType().ofType, Comment);

    const opts = field.getOpts();
    assert.typeOf(opts.descriptor.value, 'function');
    assert.equal(opts.propertyOrMethodName, 'comments');
    assert.isFalse(opts.isStaticFunction);
    assert.equal(opts.resolverTarget, ArticleRepository);
    assert.isUndefined(opts.description);
  });

  it('decorates with name', () => {
    @ObjectType()
    class Article {}

    @ObjectType()
    class Comment {}

    class ArticleRepository {
      @FieldResolver(Article, Types.List(Comment), { name: 'comments' })
      async getComments(): Promise<Comment[]> {
        return new Promise<Comment[]>(resolve => resolve([new Comment()]));
      }
    }

    const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, Article);

    assert.instanceOf(metadata, Metadata);
    assert.equal(metadata.getTarget(), Article);
    assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
    assert.equal(metadata.getType(), GraphQLObjectType);
    assert.equal(metadata.getName(), 'Article');
    assert.isUndefined(metadata.getObjectType());

    assert.lengthOf(Object.values(metadata.getFields()), 1);

    const field = metadata.getField('comments');

    assert.equal(field.getFieldName(), 'comments');
    assert.instanceOf(field.getType(), WrappedType);
    assert.equal(field.getType().TypeConstructor, GraphQLList);
    assert.equal(field.getType().ofType, Comment);

    const opts = field.getOpts();
    assert.typeOf(opts.descriptor.value, 'function');
    assert.equal(opts.propertyOrMethodName, 'getComments');
    assert.isFalse(opts.isStaticFunction);
    assert.equal(opts.resolverTarget, ArticleRepository);
    assert.isUndefined(opts.description);
  });

  it('decorates with description', () => {
    @ObjectType()
    class Article {}
    @ObjectType()
    class Comment {}

    class ArticleRepository {
      @FieldResolver(Article, Types.List(Comment), {
        name: 'comments',
        description: 'Gets a list of comments.',
      })
      async getComments(): Promise<Comment[]> {
        return new Promise<Comment[]>(resolve => resolve([new Comment()]));
      }
    }

    const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, Article);

    assert.instanceOf(metadata, Metadata);
    assert.equal(metadata.getTarget(), Article);
    assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
    assert.equal(metadata.getType(), GraphQLObjectType);
    assert.equal(metadata.getName(), 'Article');
    assert.isUndefined(metadata.getObjectType());

    assert.lengthOf(Object.values(metadata.getFields()), 1);

    const field = metadata.getField('comments');

    assert.equal(field.getFieldName(), 'comments');
    assert.instanceOf(field.getType(), WrappedType);
    assert.equal(field.getType().TypeConstructor, GraphQLList);
    assert.equal(field.getType().ofType, Comment);

    const opts = field.getOpts();
    assert.typeOf(opts.descriptor.value, 'function');
    assert.equal(opts.propertyOrMethodName, 'getComments');
    assert.isFalse(opts.isStaticFunction);
    assert.equal(opts.resolverTarget, ArticleRepository);
    assert.equal(opts.description, 'Gets a list of comments.');
  });

  // it('decorates with name', () => {
  //   @ObjectType({ name: 'Article' })
  //   class ArticleModel {}
  //
  //   const metadata = Reflect.getMetadata(OBJECT_TYPE_KEY, ArticleModel);
  //
  //   assert.instanceOf(metadata, Metadata);
  //   assert.equal(metadata.getTarget(), ArticleModel);
  //   assert.equal(metadata.getKey(), OBJECT_TYPE_KEY);
  //   assert.equal(metadata.getType(), GraphQLObjectType);
  //   assert.isEmpty(metadata.getFields());
  //   assert.equal(metadata.getName(), 'Article');
  //   assert.isUndefined(metadata.getObjectType());
  // });
});
