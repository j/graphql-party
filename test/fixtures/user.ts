import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import dedent from 'graphql/jsutils/dedent';
import {
  Types,
  ObjectType,
  InputType,
  Field,
  Query,
  Mutation,
  Arg,
  Context,
} from '../../src';

@ObjectType({ description: 'User accounts.' })
export class User {
  @Field(Types.ID) id: string;

  @Field(Types.String) firstName: string;

  @Field(Types.String) lastName: string;

  @Field(Types.String, {
    resolve: user => `${user.firstName} ${user.lastName}`,
  })
  fullName: string;

  @Field(GraphQLDateTime) createdAt: Date;

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
  @Query(User, { args: { id: Types.ID }, description: 'Gets a user.' })
  User(obj, { id } = { id: Types.ID }, context): User {
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
  @Mutation(User, {
    args: { input: Types.NonNullable(UserInput) },
    description: 'Creates a user.',
  })
  createUser(obj, { input }: { input: UserInput }, context): User {
    return context.createUser(input.firstName, input.lastName);
  }

  @Mutation(User, {
    args: {
      id: Types.NonNullable(Types.ID),
      input: Types.NonNullable(UserInput),
    },
    description: 'Updates a user.',
  })
  updateUser(
    @Arg('id') id: string,
    @Arg('input') input: UserInput,
    @Context('updateUser') updateUser: Function
  ): User {
    return updateUser(id, input);
  }
}

export function createContext() {
  const db = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date() },
    { id: 2, firstName: 'Jack', lastName: 'Johnson', createdAt: new Date() },
  ];

  return {
    db,
    createUser: (firstName, lastName): User => {
      const data = {
        id: db.length + 1,
        firstName,
        lastName,
        createdAt: new Date(),
      };

      const user = new User(data.id, firstName, lastName, data.createdAt);

      db.push(data);

      return user;
    },
    updateUser: (id, input: UserInput): User => {
      const userData = db[parseInt(id) - 1];

      if (!userData) {
        return null;
      }

      const user = new User(
        userData.id,
        input.firstName,
        input.lastName,
        userData.createdAt
      );

      userData.firstName = user.firstName;
      userData.lastName = user.lastName;

      return user;
    },
  };
}

export const expectedUserSchema = dedent`
  """
  A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the
  \`date-time\` format outlined in section 5.6 of the RFC 3339 profile of the ISO
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
`;
