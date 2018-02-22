import { GraphQLServer } from 'graphql-yoga';
import { buildSchema } from '../../src';
import * as fixtures from "../../test/fixtures/user";

const classes = Object.values(fixtures).filter((target) => typeof target === 'function');
const schema = buildSchema({ classes });
const server = new GraphQLServer({
  schema,
  context: fixtures.createContext()
});

server.start(() => console.log('Server is running on http://localhost:4000'));
