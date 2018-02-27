import { GraphQLServer } from 'graphql-yoga';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Entity, EntityRepository, EntityManager, getCustomRepository, ObjectID, ObjectIdColumn, Column, createConnection } from 'typeorm';
import * as faker from 'faker';
import { ObjectType, InputType, Query, Mutation, Arg, Context, Field, Types, setInstance, buildSchema } from '../../src';

@Entity()
@ObjectType()
class User {
  @ObjectIdColumn()
  @Field(Types.String)
  id: ObjectID;

  @Column()
  @Field(Types.String)
  firstName: string;

  @Column()
  @Field(Types.String)
  lastName: string;

  @Column()
  bestFriendId: string;

  // ideally this should go in the repository... coming soon...
  @Field(User)
  bestFriend(@Context('userRepository') repository) {
    if (!this.bestFriendId) {
      return null;
    }

    return repository.findBestFriend(this.bestFriendId);
  }

  @Field(Types.String)
  fullName() {
    return `${this.firstName} ${this.lastName}`
  };
}

@InputType()
class UserInput {
  @Field(Types.NonNullable(Types.String))
  firstName: string;

  @Field(Types.NonNullable(Types.String))
  lastName: string;
}

@EntityRepository()
class UserRepository {
  constructor(private manager: EntityManager) {}

  @Mutation(Types.Boolean)
  async seed() {
    const user = await this.manager.findOne(User, { order: { _id: -1 } });

    await this.manager.save(await this.manager.create(User, [
      { firstName: faker.name.firstName(), lastName: faker.name.lastName(), bestFriendId: user ? user.id : undefined },
      { firstName: faker.name.firstName(), lastName: faker.name.lastName(), bestFriendId: user ? user.id : undefined }
    ]));


    return true;
  }

  @Mutation(User)
  async createUser(@Arg('input', Types.NonNullable(UserInput)) input: UserInput) {
    return this.manager.save(await this.manager.create(User, input));
  }

  @Query(Types.List(User))
  async users() {
    return await this.manager.find(User, {});
  }

  @Query(User)
  async findByName(
    @Arg('firstName', Types.String) firstName: string,
    @Arg('lastName', Types.String) lastName: string
  ) {
    return await this.manager.findOne(User, { firstName, lastName });
  }

  async findBestFriend(id) {
    return await this.manager.findOneById(User, id);
  }
}

(async function start() {
  const mongod = new MongoMemoryServer();

  await createConnection({
    type: 'mongodb',
    url: await mongod.getConnectionString(),
    entities: [
      User
    ]
  });

  const userRepository = getCustomRepository(UserRepository);

  // seed some data
  await userRepository.seed();

  setInstance(UserRepository, userRepository);

  const server = new GraphQLServer({
    schema: buildSchema(User, UserInput, UserRepository),
    context: {
      userRepository
    }
  });

  server.start(() => console.log('Server is running on http://localhost:4000'));
})();
