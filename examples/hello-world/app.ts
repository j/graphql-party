import { GraphQLServer } from 'graphql-yoga';
import { Query, Arg, Field, Types, buildSchema } from 'graphql-party';

class Hello {
  @Query(Types.String)
  hello(
    @Arg('hello', Types.String)
    hello: string
  ) {
    return hello;
  }
}

const server = new GraphQLServer({
  schema: buildSchema(Hello),
});

server.start(() => console.log('Server is running on http://localhost:4000!'));
