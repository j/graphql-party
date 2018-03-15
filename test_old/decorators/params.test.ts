import 'mocha';
import { graphql } from 'graphql';
import { assert } from 'chai';
import { ObjectType, Query, Arg, Context, Types, buildSchema } from '../../src';
import {
  OBJECT_QUERY_TYPE_KEY,
  OBJECT_TYPE_KEY,
  PARAM_METADATA_KEY,
} from '../../src/metadata/index';
import { Metadata } from '../../src/metadata/metadata';
import { execQuery } from '../helpers';

describe('@Arg()', () => {
  it('decorates queries with one argument', () => {
    class ArticleRepository {
      @Query(Types.String)
      public getArticles(
        @Arg('hello', Types.String)
        hello: string
      ): string {
        return hello;
      }
    }

    const queryMetadata = Reflect.getOwnMetadataKeys(ArticleRepository);
    const keyMetadata = Reflect.getMetadata(
      PARAM_METADATA_KEY,
      ArticleRepository.prototype,
      'getArticles'
    );

    assert.lengthOf(queryMetadata, 1);
    assert.isTrue(queryMetadata.includes(OBJECT_QUERY_TYPE_KEY));
    assert.deepEqual(keyMetadata, [
      {
        paramType: '@Arg',
        paramIndex: 0,
        field: 'hello',
        type: Types.String,
      },
    ]);
  });

  it('decorates queries with two arguments', async () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        @Arg('hello', Types.String)
        hello: string,
        @Arg('world', Types.String)
        world: string
      ): Promise<string> {
        return `${hello} ${world}`;
      }
    }

    const queryMetadata = Reflect.getOwnMetadataKeys(ArticleRepository);
    const keyMetadata = Reflect.getMetadata(
      PARAM_METADATA_KEY,
      ArticleRepository.prototype,
      'getArticles'
    );

    assert.lengthOf(queryMetadata, 1);
    assert.isTrue(queryMetadata.includes(OBJECT_QUERY_TYPE_KEY));
    assert.deepEqual(keyMetadata, [
      {
        paramType: '@Arg',
        paramIndex: 0,
        field: 'hello',
        type: Types.String,
      },
      {
        paramType: '@Arg',
        paramIndex: 1,
        field: 'world',
        type: Types.String,
      },
    ]);

    const schema = buildSchema(ArticleRepository);

    const result = await graphql(
      schema,
      `
        query {
          getArticles(hello: "Hello", world: "World")
        }
      `
    );

    assert.deepEqual(result, {
      data: {
        getArticles: 'Hello World',
      },
    });
  });

  it('errors with param before @Arg()', () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        iDontBelongHere: string,
        @Arg('hello', Types.String)
        hello: string,
        @Arg('world', Types.String)
        world: string
      ): Promise<string> {
        return `${hello} ${world}`;
      }
    }

    assert.throw(
      () => buildSchema(ArticleRepository),
      '@Arg must be declared before any other parameter in "getArticles".'
    );
  });

  it('errors if they are not defined in order', () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        @Arg('hello', Types.String)
        hello: string,
        iDontBelongHere: string,
        @Arg('world', Types.String)
        world: string
      ): Promise<string> {
        return `${hello} ${world}`;
      }
    }

    assert.throw(
      () => buildSchema(ArticleRepository),
      '@Arg must be declared before any other parameter in "getArticles".'
    );
  });

  it('errors if @Context() is first', () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        @Context() context: any,
        @Arg('hello', Types.String)
        hello: string,
        @Arg('world', Types.String)
        world: string
      ): Promise<string> {
        return `${hello} ${world}`;
      }
    }

    assert.throw(
      () => buildSchema(ArticleRepository),
      '@Arg must be declared before any other parameter in "getArticles".'
    );
  });

  it('errors if @Context() is in between', () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        @Arg('hello', Types.String)
        hello: string,
        @Context() context: any,
        @Arg('world', Types.String)
        world: string
      ): Promise<string> {
        return `${hello} ${world}`;
      }
    }

    assert.throw(
      () => buildSchema(ArticleRepository),
      '@Arg must be declared before any other parameter in "getArticles".'
    );
  });

  it('works with @Context()', async () => {
    class ArticleRepository {
      @Query(Types.String)
      async getArticles(
        @Arg('hello', Types.String)
        hello: string,
        @Arg('world', Types.String)
        world: string,
        @Context() context: { shout: Function }
      ): Promise<string> {
        return context.shout(`${hello} ${world}`);
      }
    }

    const schema = buildSchema(ArticleRepository);

    const result = await graphql(
      schema,
      `
        query {
          getArticles(hello: "Hello", world: "World")
        }
      `,
      null,
      {
        shout: (str: string) => str.toUpperCase(),
      }
    );

    assert.deepEqual(result, {
      data: {
        getArticles: 'HELLO WORLD',
      },
    });
  });

  it('passes original args after decorated args', async () => {
    let calledWithArgs = [];
    class HelloWorld {
      @Query(Types.String)
      public hello(
        @Arg('hi', Types.String)
        hello: string,
        obj,
        args,
        context
      ): string {
        calledWithArgs = Object.values(arguments);

        return `${hello} ${context.world}`;
      }
    }

    const schema = buildSchema(HelloWorld);

    const result = await graphql(schema, 'query { hello(hi: "hello") }', null, {
      world: 'world',
    });

    assert.lengthOf(calledWithArgs, 5);
    assert.equal(calledWithArgs[0], 'hello');
    assert.equal(calledWithArgs[1], null);
    assert.deepEqual(calledWithArgs[2], { hi: 'hello' });
    assert.deepEqual(calledWithArgs[3], { world: 'world' });
    assert.equal(calledWithArgs[4].fieldName, 'hello');

    assert.deepEqual(result, { data: { hello: 'hello world' } });
  });
});

describe('@Context()', () => {
  it('decorates queries with @Context() without args', async () => {
    class HelloWorld {
      @Query(Types.String)
      public hello(@Context() context: { hello: string }): string {
        return context.hello;
      }
    }

    const queryMetadata = Reflect.getOwnMetadataKeys(HelloWorld);
    const keyMetadata = Reflect.getMetadata(
      PARAM_METADATA_KEY,
      HelloWorld.prototype,
      'hello'
    );

    assert.lengthOf(queryMetadata, 1);
    assert.isTrue(queryMetadata.includes(OBJECT_QUERY_TYPE_KEY));
    assert.deepEqual(keyMetadata, [
      {
        paramType: '@Context',
        paramIndex: 0,
        field: undefined,
        type: undefined,
      },
    ]);

    const schema = buildSchema(HelloWorld);

    const result = await graphql(schema, 'query { hello }', null, {
      hello: 'world',
    });

    assert.deepEqual(result, { data: { hello: 'world' } });
  });

  it('decorates queries with @Context() with args', async () => {
    class HelloWorld {
      @Query(Types.String)
      public hello(@Context('hello') hello: string): string {
        return hello;
      }
    }

    const queryMetadata = Reflect.getOwnMetadataKeys(HelloWorld);
    const keyMetadata = Reflect.getMetadata(
      PARAM_METADATA_KEY,
      HelloWorld.prototype,
      'hello'
    );

    assert.lengthOf(queryMetadata, 1);
    assert.isTrue(queryMetadata.includes(OBJECT_QUERY_TYPE_KEY));
    assert.deepEqual(keyMetadata, [
      {
        paramType: '@Context',
        paramIndex: 0,
        field: 'hello',
        type: undefined,
      },
    ]);

    const schema = buildSchema(HelloWorld);

    const result = await graphql(schema, 'query { hello }', null, {
      hello: 'world',
    });

    assert.deepEqual(result, { data: { hello: 'world' } });
  });

  it('passes original args after decorated args', async () => {
    let calledWithArgs = [];
    class HelloWorld {
      @Query(Types.String)
      public hello(
        @Context('hello') hello: string,
        obj,
        args,
        context
      ): string {
        calledWithArgs = Object.values(arguments);

        return `${hello} ${context.world}`;
      }
    }

    const queryMetadata = Reflect.getOwnMetadataKeys(HelloWorld);
    const keyMetadata = Reflect.getMetadata(
      PARAM_METADATA_KEY,
      HelloWorld.prototype,
      'hello'
    );

    assert.lengthOf(queryMetadata, 1);
    assert.isTrue(queryMetadata.includes(OBJECT_QUERY_TYPE_KEY));
    assert.deepEqual(keyMetadata, [
      {
        paramType: '@Context',
        paramIndex: 0,
        field: 'hello',
        type: undefined,
      },
    ]);

    const schema = buildSchema(HelloWorld);

    const result = await graphql(schema, 'query { hello }', null, {
      hello: 'hello',
      world: 'world',
    });

    assert.lengthOf(calledWithArgs, 5);
    assert.equal(calledWithArgs[0], 'hello');
    assert.equal(calledWithArgs[1], null);
    assert.deepEqual(calledWithArgs[2], {});
    assert.deepEqual(calledWithArgs[3], { hello: 'hello', world: 'world' });
    assert.equal(calledWithArgs[4].fieldName, 'hello');

    assert.deepEqual(result, { data: { hello: 'hello world' } });
  });
});
