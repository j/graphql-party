import { GraphQLServer } from 'graphql-yoga';
import * as graphql from 'graphql';
import { ObjectType, InputType, Query, Mutation, Field, Types, buildObjectType } from '../../src';
import {buildMutationObjectType, buildQueryObjectType} from "../../src/buildObjectType";

let id = 1;
const users = [];
const addresses = [];

@ObjectType()
class Address {
  @Field(Types.String)
  public city: string;
}

@ObjectType()
class User {
  @Field(Types.ID)
  public id: number;

  @Field(Types.String)
  public firstName: string;

  @Field(Types.String)
  public lastName: string;

  @Field(User)
  public bestFriend: User;

  @Field(Types.List(User))
  public friends: User[];

  @Field(Address)
  public address: Address;

  constructor(firstName: string, lastName: string) {
    this.id = id++;
    this.firstName = firstName;
    this.lastName = lastName;
    this.address = new Address();
    this.address.city = `${this.id} Main St`;

    addresses.push(this.address);
  }

  @Field(Types.String)
  async fullName(): Promise<string> {
    return new Promise((resolve) => {
      resolve(`${this.firstName}  ${this.lastName}`);
    });
  }

  @Field(Types.NonNullable(User), { args: { id: Types.ID } })
  async friend({ id }: { id: number }): Promise<string> {
    return new Promise((resolve) => {
      resolve(users[id-1]);
    });
  }
}

@InputType()
class UserInput {
  @Field(Types.NonNullable(Types.String))
  public firstName: string;

  @Field(Types.NonNullable(Types.String))
  public lastName: string;
}


class UsersRepository {
  @Query(User, { args: { id: Types.ID } })
  async user({ id }: { id: number }): Promise<User> {
    return new Promise((resolve) => {
      resolve(users[id-1]);
    });
  }

  @Query(Types.List(User))
  async users(): Promise<User[]> {
    return new Promise((resolve) => {
      resolve(users);
    });
  }

  @Mutation(User, { args: { input: Types.NonNullable(UserInput) } })
  async createUser({ input }: { input: UserInput }): Promise<User[]> {
    return new Promise((resolve) => {
      const user = new User(input.firstName, input.lastName);

      users.push(user);

      resolve(user);
    });
  }
}

class AddressRepository {
  @Query(Types.List(Address))
  async addresses(): Promise<Address[]> {
    return new Promise((resolve) => {
      resolve(addresses);
    });
  }
}

const john = new User('John', 'Snow');
const betty = new User('Daenerys', 'Targaryen');
const alfred = new User('Khal', 'Drogo');

betty.bestFriend = john;
john.bestFriend = betty;
john.friends = [betty, alfred];

users.push(john);
users.push(betty);
users.push(alfred);

[UserInput, User, Address].map(buildObjectType);

const schema = new graphql.GraphQLSchema({
  query: buildQueryObjectType([UsersRepository, AddressRepository]),
  mutation: buildMutationObjectType([UsersRepository, AddressRepository])
});

console.log(graphql.printSchema(schema));

const server = new GraphQLServer({ schema });
server.start(() => console.log('Server is running on localhost:4000'));
