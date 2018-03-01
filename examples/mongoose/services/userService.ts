import * as delay from 'await-delay';
import { ObjectID } from 'mongodb';
import { User } from '../models/user';
import {
  Query,
  Mutation,
  InputType,
  Arg,
  Field,
  FieldResolver,
  Types,
} from '../../../src';

@InputType()
export class UserInput {
  @Field(Types.NonNullable(Types.String))
  firstName: string;

  @Field(Types.NonNullable(Types.String))
  lastName: string;

  @Field(Types.NonNullable(Types.String))
  slug: string;

  @Field(Types.String) bestFriend: string;
}

export class UserRepository {
  constructor(private UserModel: Model) {}

  async seed({ users }: { users: any[] }) {
    const promises = [];

    users.forEach(user => {
      promises.push(
        new Promise(async resolve => {
          // hack for now since mongo mem server doesn't support safe writes
          let retries = 5;
          const getBestFriend = async () => {
            if (!user.bestFriend) {
              return null;
            }

            const bestFriend = await this.UserModel.findOne({
              slug: user.bestFriend,
            });

            if (bestFriend) {
              return bestFriend;
            }

            retries--;

            if (retries > 0) {
              await delay(200);

              return getBestFriend();
            }

            return null;
          };

          const bestFriend = await getBestFriend();

          const newUser = new this.UserModel({
            firstName: user.firstName,
            lastName: user.lastName,
            slug: user.slug,
            bestFriendId: bestFriend && bestFriend._id ? bestFriend._id : null,
          });

          resolve(await newUser.save());
        })
      );
    });

    await Promise.all(promises);

    return true;
  }

  @Mutation(User)
  async createUser(
    @Arg('input', Types.NonNullable(UserInput))
    input: UserInput
  ) {
    const bestFriend = input.bestFriend;
    delete input.bestFriend;

    const user = new this.UserModel(input);

    if (bestFriend) {
      const foundBestFriend = await this.UserModel.findOne({
        slug: bestFriend,
      });

      if (foundBestFriend) {
        user.bestFriendId = foundBestFriend._id;
      }
    }

    await user.save();

    await delay(300);

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
  async findBestFriend(user): Promise<User> {
    if (!user.bestFriendId) {
      return null;
    }

    return await this.UserModel.findById(user.bestFriendId);
  }

  @FieldResolver(User, Types.Boolean)
  async isFriendsWith(
    @Arg('firstName', Types.String)
    firstName: string,
    @Arg('lastName', Types.String)
    lastName: string,
    user: User
  ): Promise<User> {
    const bestFriend = await this.findBestFriend(user);

    const friend = await this.findByName(firstName, lastName);

    if (!bestFriend || !friend) {
      return false;
    }

    return bestFriend.id === friend.id;
  }
}
