// import 'mocha';
// import { assert } from 'chai';
// import * as globby from 'globby';
// import * as path from 'path';
// import { graphql, GraphQLSchema } from 'graphql';
// import * as data from '../examples/data';
//
// const files = globby.sync(
//   path.join(process.cwd(), 'examples', '**', 'schema.ts')
// );
// const schemas = files.map(file => require(file));
//
// schemas.forEach(({ name, prepare }) => {
//   describe(`Example "${name}"`, () => {
//     let context: any;
//     let schema: GraphQLSchema;
//     let teardown: Function;
//
//     before(async () => {
//       const prepared = await prepare({ users: data.users() });
//
//       context = prepared.context;
//       schema = prepared.schema;
//       teardown = prepared.teardown;
//
//       return;
//     });
//
//     after(async () => {
//       await teardown();
//     });
//
//     it(`has valid "users" query`, async () => {
//       const source = `
//         query {
//           users {
//             id
//             firstName
//             lastName
//             fullName
//             bestFriend {
//               fullName
//             }
//             isFriendsWithJordy: isFriendsWith(firstName: "Jordy", lastName: "Smith")
//             isFriendsWithKelly: isFriendsWith(firstName: "Kelly", lastName: "Slater")
//           }
//         }
//       `;
//
//       const result = await graphql({
//         source,
//         schema,
//         contextValue: context,
//       });
//
//       assert.deepEqual(result, {
//         data: {
//           users: [
//             {
//               id: result.data.users[0].id,
//               firstName: 'Kelly',
//               lastName: 'Slater',
//               fullName: 'Kelly Slater',
//               bestFriend: null,
//               isFriendsWithJordy: false,
//               isFriendsWithKelly: false,
//             },
//             {
//               id: result.data.users[1].id,
//               firstName: 'Jordy',
//               lastName: 'Smith',
//               fullName: 'Jordy Smith',
//               bestFriend: {
//                 fullName: 'Kelly Slater',
//               },
//               isFriendsWithJordy: false,
//               isFriendsWithKelly: true,
//             },
//           ],
//         },
//       });
//     });
//
//     it(`has valid "createUser" mutation`, async () => {
//       const source = `
//         mutation createUser($input: UserInput!) {
//           createUser(input: $input) {
//             id
//             firstName
//             lastName
//             fullName
//             bestFriend {
//               fullName
//             }
//             isFriendsWithJordy: isFriendsWith(firstName: "Jordy", lastName: "Smith")
//             isFriendsWithKelly: isFriendsWith(firstName: "Kelly", lastName: "Slater")
//           }
//         }
//       `;
//
//       const result = await graphql({
//         source,
//         schema,
//         contextValue: context,
//         variableValues: {
//           input: {
//             firstName: 'John John',
//             lastName: 'Florence',
//             slug: 'john-john',
//             bestFriend: 'jordy-smith',
//           },
//         },
//       });
//
//       assert.deepEqual(result, {
//         data: {
//           createUser: {
//             id: result.data.createUser.id,
//             firstName: 'John John',
//             lastName: 'Florence',
//             fullName: 'John John Florence',
//             bestFriend: {
//               fullName: 'Jordy Smith',
//             },
//             isFriendsWithJordy: true,
//             isFriendsWithKelly: false,
//           },
//         },
//       });
//     });
//   });
// });
