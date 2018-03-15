import 'mocha';
import { assert } from 'chai';
import { GraphQLDateTime } from 'graphql-iso-date';
import { ObjectType, Field, Types, deserialize } from '../../src';
import { AllTheThings, AllTheThingsChild } from '../fixtures/allTheThings';

describe('deserialize()', () => {
  it('de-serializes a custom scalar', () => {
    @ObjectType()
    class Post {
      @Field(GraphQLDateTime) createdAt: Date;

      @Field(Types.NonNullable(Types.List(GraphQLDateTime)))
      createdAts: Date[];
    }

    const post = deserialize(Post, {
      createdAt: '2018-03-07T22:46:16.885Z',
      createdAts: ['2018-04-07T22:46:16.885Z', '2018-05-07T22:46:16.885Z'],
    });

    assert.instanceOf(post, Post);
    assert.instanceOf(post.createdAt, Date);
    assert.instanceOf(post.createdAts[0], Date);
    assert.instanceOf(post.createdAts[1], Date);
    assert.equal(
      post.createdAt.toString(),
      'Wed Mar 07 2018 14:46:16 GMT-0800 (PST)'
    );
    assert.equal(
      post.createdAts[0].toString(),
      'Sat Apr 07 2018 15:46:16 GMT-0700 (PDT)'
    );
    assert.equal(
      post.createdAts[1].toString(),
      'Mon May 07 2018 15:46:16 GMT-0700 (PDT)'
    );
  });

  it("de-serializes a mimic'd DB value", () => {
    class DBID {
      constructor(private key: string) {}

      getKey() {
        return `key:${this.key}`;
      }
    }

    @ObjectType()
    class Post {
      @Field(Types.NonNullable(Types.ID))
      id: DBID;
    }

    const post = deserialize(
      Post,
      {
        id: new DBID('ABC'),
      },
      {
        types: [
          {
            type: Types.ID,
            parseValue: data => {
              if (data instanceof DBID) {
                return data;
              }

              return Types.ID.parseValue(data);
            },
          },
        ],
      }
    );

    assert.instanceOf(post, Post);
    assert.instanceOf(post.id, DBID);
  });

  it("de-serializes a mimic'd DB value using parseValue false", () => {
    class DBID {
      constructor(private key: string) {}

      getKey() {
        return `key:${this.key}`;
      }
    }

    @ObjectType()
    class Post {
      @Field(Types.NonNullable(Types.ID))
      id: DBID;
    }

    const post = deserialize(Post, { id: new DBID('ABC') }, false);

    assert.instanceOf(post, Post);
    assert.instanceOf(post.id, DBID);
  });

  it('de-serializes a custom scalar with custom deserializer', () => {
    @ObjectType()
    class Post {
      @Field(GraphQLDateTime) createdAt: Date;

      @Field(Types.List(GraphQLDateTime))
      createdAts: Date[];
    }

    const post = deserialize(
      Post,
      {
        createdAt: new Date('2018-03-07T22:46:16.885Z'),
        createdAts: [
          new Date('2018-04-07T22:46:16.885Z'),
          new Date('2018-05-07T22:46:16.885Z'),
        ],
      },
      {
        types: [
          {
            type: GraphQLDateTime,
            parseValue: data => data,
          },
        ],
      }
    );

    assert.instanceOf(post, Post);
    assert.instanceOf(post.createdAt, Date);
    assert.instanceOf(post.createdAts[0], Date);
    assert.instanceOf(post.createdAts[1], Date);
    assert.equal(
      post.createdAt.toString(),
      'Wed Mar 07 2018 14:46:16 GMT-0800 (PST)'
    );
    assert.equal(
      post.createdAts[0].toString(),
      'Sat Apr 07 2018 15:46:16 GMT-0700 (PDT)'
    );
    assert.equal(
      post.createdAts[1].toString(),
      'Mon May 07 2018 15:46:16 GMT-0700 (PDT)'
    );
  });

  it("bypasses a Type's parseValue call", () => {
    @ObjectType()
    class Post {
      @Field(GraphQLDateTime) createdAt: Date;

      @Field(Types.List(GraphQLDateTime))
      createdAts: Date[];
    }

    const post = deserialize(
      Post,
      {
        createdAt: new Date('2018-03-07T22:46:16.885Z'),
        createdAts: [
          new Date('2018-04-07T22:46:16.885Z'),
          new Date('2018-05-07T22:46:16.885Z'),
        ],
      },
      {
        parseValues: false,
      }
    );

    assert.instanceOf(post, Post);
    assert.instanceOf(post.createdAt, Date);
    assert.instanceOf(post.createdAts[0], Date);
    assert.instanceOf(post.createdAts[1], Date);
    assert.equal(
      post.createdAt.toString(),
      'Wed Mar 07 2018 14:46:16 GMT-0800 (PST)'
    );
    assert.equal(
      post.createdAts[0].toString(),
      'Sat Apr 07 2018 15:46:16 GMT-0700 (PDT)'
    );
    assert.equal(
      post.createdAts[1].toString(),
      'Mon May 07 2018 15:46:16 GMT-0700 (PDT)'
    );
  });

  it('returns valid object from plain JS object.', () => {
    const data1 = {
      idField: 'abc',
      idFieldNonNullable: 'def',
      idFieldList: ['one', 'two', 'three'],
      idFieldListNonNullable: ['four', 'five', 'six'],
      idFieldNonNullableListNonNullable: ['seven', 'eight', 'nine'],

      stringField: 'string field',
      stringFieldNonNullable: 'string field non nullable',

      intField: 11,
      intFieldNonNullable: 22,

      newField: 'new field',

      childField: {
        id: 'child id',
        title: 'child title',
      },
    };

    const data2 = {
      idField: 'abc2',
      idFieldNonNullable: 'def2',
      idFieldList: ['one2', 'two2', 'three2'],
      idFieldListNonNullable: ['four2', 'five2', 'six2'],
      idFieldNonNullableListNonNullable: ['seven2', 'eight2', 'nine2'],

      stringField: 'string field2',
      stringFieldNonNullable: 'string field non nullable2',

      intField: 33,
      intFieldNonNullable: 44,

      newField: 'new field 2',
    };

    data1.selfType = data2;

    const allTheThings = deserialize(AllTheThings, data1);

    assert.deepEqual(
      JSON.parse(JSON.stringify(allTheThings)),
      JSON.parse(JSON.stringify(data1))
    );

    assert.instanceOf(allTheThings.selfType, AllTheThings);
    assert.instanceOf(allTheThings.childField, AllTheThingsChild);
  });
});
