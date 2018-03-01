import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, createConnection, model } from 'mongoose';
import { userSchema } from './models/user';
import { UserRepository } from './services/userService';
import { setInstance, buildSchema } from '../../src';

export const name = 'mongoose';

export async function prepare(fixtures: { users: any[] } = { users: [] }) {
  const mongod = new MongoMemoryServer();

  const connection = await createConnection(await mongod.getConnectionString());

  const userRepository = new UserRepository(
    connection.model('User', userSchema)
  );

  // seed some data
  await userRepository.seed(fixtures);

  setInstance(UserRepository, userRepository);

  return {
    schema: buildSchema('./{models,services}/*.ts', { cwd: __dirname }),
    context: {},
    teardown: async () => {},
  };
}
