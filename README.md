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


### Example
```javascript
import { printSchema } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import dedent from 'graphql/jsutils/dedent';
import {
  ObjectType,
  InputType,
  Query,
  Mutation,
  Field,
  Types,
  Arg,
  Context,
  buildSchema
} from 'graphql-party';

@ObjectType({ description: 'User accounts.' })
export class User {
  @Field(Types.ID)
  id: string;

  @Field(Types.String)
  firstName: string;

  @Field(Types.String)
  lastName: string;

  @Field(Types.String, {
    resolve: user => `${user.firstName} ${user.lastName}`,
  })
  fullName: string;

  @Field(GraphQLDateTime)
  createdAt: Date;

  constructor(
    id: string | number,
    firstName: string,
    lastName: string,
    createdAt: Date
  ) {
    this.id = String(id);
    this.firstName = firstName;
    this.lastName = lastName;
    this.createdAt = createdAt;
  }
}

@InputType({ description: 'Input type for createUser mutation.' })
export class UserInput {
  @Field(Types.NonNullable(Types.String))
  firstName: string;

  @Field(Types.NonNullable(Types.String))
  lastName: string;
}

export class UserQueries {
  @Query(User, { description: 'Gets a user.' })
  User(
    @Arg('id', Types.ID) id: string,
    @Context() context
  ): User {
    const result = context.db[parseInt(String(id)) - 1];

    return new User(
      result.id,
      result.firstName,
      result.lastName,
      result.createdAt
    );
  }

  @Query(Types.List(User), { description: 'Gets a list of users.' })
  users(obj, args, context): User {
    return context.db.map(
      item => new User(item.id, item.firstName, item.lastName, item.createdAt)
    );
  }
}

export class UserMutations {
  @Mutation(User, { description: 'Creates a user.' })
  createUser(
    @Arg('input', Types.NonNullable(UserInput)) input: UserInput,
    @Context() context
  ): User {
    return context.createUser(input.firstName, input.lastName);
  }

  @Mutation(User, { description: 'Updates a user.' })
  updateUser(
    @Arg('id', Types.NonNullable(Types.ID)) id: string,
    @Arg('input', Types.NonNullable(UserInput)) input: UserInput,
    @Context('updateUser') updateUser: Function
  ): User {
    return updateUser(id, input);
  }
}

console.log(printSchema(buildSchema(User, UserInput, UserQueries, UserMutations)));

/**
Outputs:

"""
A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the
`date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO
8601 standard for representation of dates and times using the Gregorian calendar.
"""
scalar DateTime

type Mutation {
    """Creates a user."""
    createUser(input: UserInput!): User
    
    """Updates a user."""
    updateUser(id: ID!, input: UserInput!): User
}

type Query {
    """Gets a user."""
    User(id: ID): User
    
    """Gets a list of users."""
    users: [User]
}

"""User accounts."""
type User {
    id: ID
    firstName: String
    lastName: String
    fullName: String
    createdAt: DateTime
}

"""Input type for createUser mutation."""
input UserInput {
    firstName: String!
    lastName: String!
}
*/
```

Check out `examples/simple` for more examples!