import { GraphQLServer } from 'graphql-yoga';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  Types as MongooseTypes,
  Model,
  Schema,
  connect,
  model,
} from 'mongoose';
import { ObjectID } from 'mongodb';
import * as faker from 'faker';
import {
  ObjectType,
  InputType,
  Query,
  Mutation,
  Arg,
  Context,
  Field,
  FieldResolver,
  Types,
  setInstance,
  buildSchema,
} from '../../src';

const schema = new Schema({
  firstName: String,
  lastName: String,
  bestFriend: { type: Schema.Types.ObjectId, ref: 'User' },
});

@ObjectType()
class User {
  @Field(Types.String, { name: 'id' })
  getId(): string {
    return this._id.toHexString();
  }

  @Field(Types.String) firstName: string;

  @Field(Types.String) lastName: string;

  @Field(Types.String)
  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

@InputType()
class UserInput {
  @Field(Types.NonNullable(Types.String))
  firstName: string;

  @Field(Types.NonNullable(Types.String))
  lastName: string;
}

class UserRepository {
  constructor(private UserModel: Model) {}

  @Mutation(Types.Boolean)
  async seed() {
    const user = await this.UserModel.findOne({}).sort({ _id: -1 });

    const user1 = new this.UserModel({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      bestFriend: user,
    });

    await user1.save();

    const user2 = new this.UserModel({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      bestFriend: user1,
    });

    await user2.save();

    return true;
  }

  @Mutation(User)
  async createUser(
    @Arg('input', Types.NonNullable(UserInput))
    input: UserInput
  ) {
    const user = new this.UserModel(input);

    await user.save();

    return user;
  }

  @Query(Types.List(User))
  async users() {
    return await this.UserModel.find({});
  }

  @Query(User)
  async findByName(
    @Arg('firstName', Types.String)
    firstName: string,
    @Arg('lastName', Types.String)
    lastName: string
  ) {
    return await this.UserModel.findOne({ firstName, lastName });
  }

  @FieldResolver(User, User, { name: 'bestFriend' })
  async findBestFriend(user) {
    return await this.UserModel.findById(user.bestFriend);
  }

  @FieldResolver(User, Types.Boolean)
  async isFriendsWith(
    @Arg('firstName', Types.String)
    firstName: string,
    @Arg('lastName', Types.String)
    lastName: string,
    user: User
  ) {
    const bestFriend = await this.findBestFriend(user);

    const friend = await this.findByName(firstName, lastName);

    if (!bestFriend || !friend) {
      return false;
    }

    return bestFriend.id === friend.id;
  }
}

(async function start() {
  const mongod = new MongoMemoryServer();

  await connect(await mongod.getConnectionString());

  schema.loadClass(User);

  const userRepository = new UserRepository(model('User', schema));

  // seed some data
  await userRepository.seed();

  setInstance(UserRepository, userRepository);

  const server = new GraphQLServer({
    schema: buildSchema(User, UserInput, UserRepository),
    context: {
      userRepository,
    },
  });

  server.start(() => console.log('Server is running on http://localhost:4000'));
})();
