import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export async function execQuery(queryType, str): Promise<any> {
  const schema = new GraphQLSchema({ query: queryType });

  return await graphql(schema, str);
}

export async function execMutation(mutationType, str): Promise<any> {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        placeholder: { type: GraphQLString },
      },
    }),
    mutation: mutationType,
  });

  return await graphql(schema, str);
}
