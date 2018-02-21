import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export async function execQuery(queryType, str) {
  const schema = new GraphQLSchema({ query: queryType });

  return graphql(schema, str);
}

export async function execMutation(mutationType, str) {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        placeholder: { type: GraphQLString },
      },
    }),
    mutation: mutationType,
  });

  return graphql(schema, str);
}
