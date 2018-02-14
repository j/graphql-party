<h1 align="center" style="border-bottom: none;">🎉🎊 graphql-party</h1>
<h3 align="center">A <a href="https://www.typescriptlang.org/docs/handbook/decorators.html">@decorator</a> based <a href="http://graphql.org/graphql-js/">GraphQL.js</a> schema builder.</h3>
<p align="center">
    <a href="https://travis-ci.org/j/graphql-party">
        <img alt="Travis" src="https://img.shields.io/travis/j/graphql-party/preview.svg">
    </a>
    <a href="https://codecov.io/gh/j/graphql-party/branch/preview">
        <img alt="Travis" src="https://img.shields.io/codecov/c/github/j/graphql-party/preview.svg">
    </a>
</p>


**graphql-party** makes it easy to create GraphQL schemas and resolvers from javascript classes using @decorators.


### Before we can party....

This is incomplete right now, but getting closer!


### Example
```javascript
import { printSchema } from 'graphql';
import { ObjectType, InputType, Field, Types, Mutation, Query, buildSchema as letsParty } from '../../src';

// ... coming soon

@InputType()
class CreateUserInput {
  @Field(Types.String)
  public firstName: string;

  @Field(Types.ID)
  public bestFriend: User;

  @Field(Types.List(Types.ID))
  public friends: User[];
}

@ObjectType()
class User {
  @Field(Types.NonNullable(Types.ID))
  public id: number;

  @Field(Types.String)
  public firstName: string;

  @Field(User)
  public bestFriend: User;

  @Field(Types.List(User))
  public friends: User[];

  constructor(firstName: string) {
    this.firstName = firstName;
  }

  // ...coming soon

  @Query({ type: Types.List(User) })
  static async getUsers(@Context('users') users: UserRepository): Promise<User[]> {
    return await users.find();
  }

  @Mutation({ type: User, args: { input: CreateUserInput } })
  static async createUser(
    @Context('users') users: UserRepository,
    @Arg('input') input: CreateUserInput
  ): Promise<User> {
    return await users.createUser(input)
  }
}

console.log(printSchema(letsParty(CreateUserInput, User)));

/**
Outputs:

type User {
  id: ID!
  firstName: String
  bestFriend: User
  friends: [User]
}

input CreateUserInput {
  firstName: String
  bestFriend: ID
  friends: [ID]
}

type Query {
  getUsers: [User]
}

type Mutation {
  createUser(input: CreateUserInput): User
}
 */

```

Check out `examples/simple` for more examples!