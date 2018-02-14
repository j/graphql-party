import { GraphQLServer } from 'graphql-yoga';
import * as graphql from 'graphql';
import { ObjectType, Field, Types, buildObjectType } from '../../src';

@ObjectType()
class User {
  @Field(Types.ID)
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
}

const userType = buildObjectType(User);

const john = new User('John');
const betty = new User('Betty');
const alfred = new User('Alfred');

betty.bestFriend = john;
john.bestFriend = betty;
john.friends = [betty, alfred];

const fakeDatabase = [john, betty, alfred];

const schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new graphql.GraphQLList(userType),
        resolve: () => fakeDatabase
      }
    }
  })
});

const server = new GraphQLServer({ schema });
server.start(() => console.log('Server is running on localhost:4000'));
