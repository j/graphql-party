import { Query, Mutation, Types, ObjectType } from '../../src';

@ObjectType()
export class InvalidObjectTypeWithQueries {
  @Query(Types.String)
  invalidQuery1() {
    return 'invalid';
  }

  @Query(Types.String)
  invalidQuery2() {
    return 'invalid';
  }
}

@ObjectType()
export class InvalidObjectTypeWithMutations {
  @Mutation(Types.String)
  invalidMutation1() {
    return 'invalid';
  }

  @Mutation(Types.String)
  invalidMutation2() {
    return 'invalid';
  }
}
