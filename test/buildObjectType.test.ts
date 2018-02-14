import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import { ObjectType, Field } from '../src/decorators';
import * as Types from '../src/types';
import { buildObjectType } from '../src/buildObjectType';
import dedent from 'graphql/jsutils/dedent';

@ObjectType()
class Post {
  @Field(Types.ID) public id: string;
  @Field(Types.String) public title: string;
}

@ObjectType()
class User {
  // ID types
  @Field(Types.ID) public idField: string;
  @Field(Types.NonNullable(Types.ID))
  public idFieldNonNullable: string;
  @Field(Types.List(Types.ID))
  public idFieldList: string[];
  @Field(Types.NonNullable(Types.List(Types.ID)))
  public idFieldListNonNullable: string[];
  @Field(Types.NonNullable(Types.List(Types.NonNullable(Types.ID))))
  public idFieldNonNullableListNonNullable: string[];

  // String types
  @Field(Types.String) public stringField: string;
  @Field(Types.NonNullable(Types.String))
  public stringFieldNonNullable: string;

  // Int types
  @Field(Types.Int) public intField: Number;
  @Field(Types.NonNullable(Types.Int))
  public intFieldNonNullable: Number;

  // Self Types
  @Field(User) public selfType: User;
  @Field(Types.NonNullable(User))
  public selfTypeNonNullable: User;
  @Field(Types.List(User))
  public selfTypeList: User[];
  @Field(Types.List(Types.NonNullable(User)))
  public selfTypeNonNullableList: User[];
  @Field(Types.NonNullable(Types.List(User)))
  public selfTypeListNonNullable: User[];
  @Field(Types.NonNullable(Types.List(Types.NonNullable(User))))
  public selfTypeNonNullableListNonNullable: User[];

  // Post Types
  @Field(Post) public postField: Post;

  // Type with field name over-ride.
  @Field(Types.String, { name: 'new' })
  public newField: string;
}

describe('buildObjectType()', () => {
  it('Builds decorated "User" and "Post"', () => {
    const userType = buildObjectType(User);

    // Register the Post field
    const postType = buildObjectType(Post);

    assert.equal(
      graphql.printType(userType),
      dedent`
      type User {
        idField: ID
        idFieldNonNullable: ID!
        idFieldList: [ID]
        idFieldListNonNullable: [ID]!
        idFieldNonNullableListNonNullable: [ID!]!
        stringField: String
        stringFieldNonNullable: String!
        intField: Int
        intFieldNonNullable: Int!
        selfType: User
        selfTypeNonNullable: User!
        selfTypeList: [User]
        selfTypeNonNullableList: [User!]
        selfTypeListNonNullable: [User]!
        selfTypeNonNullableListNonNullable: [User!]!
        postField: Post
        new: String
      }`
    );

    assert.equal(
      graphql.printType(postType),
      dedent`
      type Post {
        id: ID
        title: String
      }`
    );
  });

  it('Errors when types are not valid', () => {
    class Article {}
    assert.throw(
      () => buildObjectType(Article),
      `Object "Article" is not a valid ObjectType.`
    );
  });
});
