import { GraphQLServer } from 'graphql-yoga';
import { prepare } from './schema';
import * as data from '../data';

(async function start() {
  const { schema, context } = await prepare({ users: data.users() });

  const server = new GraphQLServer({
    schema,
    context,
  });

  server.start(() => console.log('Server is running on http://localhost:4000'));
})();
