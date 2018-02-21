import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import dedent from 'graphql/jsutils/dedent';
import {
  Types,
  ObjectType,
  InputType,
  Field,
  Query,
  Mutation,
} from '../../src';

let db = [];

export function resetDb() {
  db = [
    { firstName: 'John', lastName: 'Doe' },
    { firstName: 'Jack', lastName: 'Johnson' },
  ];
}

resetDb();

@ObjectType({ description: 'User accounts.' })
export class User {
  @Field(Types.String) firstName: string;

  @Field(Types.String) lastName: string;

  @Field(Types.String, {
    resolve: user => `${user.firstName} ${user.lastName}`,
  })
  fullName: string;

  @Field(GraphQLDate) dob: Date;

  constructor(firstName: string, lastName: string, dob: Date) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.dob = dob;
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
  @Query(User, { args: { id: Types.Int }, description: 'Gets users.' })
  User(): User {
    const result = db[0];

    return new User(result.firstName, result.lastName, new Date());
  }
}

export class UserMutations {
  @Mutation(User, {
    args: { input: Types.NonNullable(UserInput) },
    description: 'Creates a user.',
  })
  createUser(): User {
    const result = db[0];

    return new User(result.firstName, result.lastName, new Date());
  }
}

export const expectedUserSchema = dedent`
  """
  A date string, such as 2007-12-03, compliant with the \`full-date\` format
  outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for
  representation of dates and times using the Gregorian calendar.
  """
  scalar Date
  
  type Mutation {
    """Creates a user."""
    createUser(input: UserInput!): User
  }
  
  type Query {
    """Gets users."""
    User(id: Int): User
  }
  
  """User accounts."""
  type User {
    firstName: String
    lastName: String
    fullName: String
    dob: Date
  }
  
  """Input type for createUser mutation."""
  input UserInput {
    firstName: String!
    lastName: String!
  }
`;
