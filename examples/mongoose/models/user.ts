import { Schema } from 'mongoose';
import { ObjectType, Field, Types } from '../../../src';

export const userSchema = new Schema({
  firstName: String,
  lastName: String,
  slug: String,
  bestFriendId: Schema.Types.ObjectId,
});

@ObjectType()
export class User {
  @Field(Types.String, { name: 'id' })
  getId(): string {
    return this._id.toHexString();
  }

  @Field(Types.String) firstName: string;

  @Field(Types.String) lastName: string;

  @Field(Types.String) slug: string;

  @Field(Types.String)
  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

userSchema.loadClass(User);
