import dedent from 'graphql/jsutils/dedent';
import { Types, ObjectType, Field, Query, Mutation } from '../../src';

@ObjectType()
export class AllTheThingsChild {
  @Field(Types.ID) public id: string;
  @Field(Types.String) public title: string;
}

@ObjectType()
export class AllTheThings {
  // ID types
  @Field(Types.ID) public idField: string;
  @Field(Types.NonNullable(Types.ID))
  public idFieldNonNullable: string;
  @Field(Types.List(Types.ID))
  public idFieldList: string[];
  @Field(Types.NonNullable(Types.List(Types.ID)))
  public idFieldListNonNullable: string[];
  @Field(Types.NonNullable(Types.List(Types.NonNullable(Types.ID))))
  public idFieldNonNullableListNonNullable: string[];

  // String types
  @Field(Types.String) public stringField: string;
  @Field(Types.NonNullable(Types.String))
  public stringFieldNonNullable: string;

  // Int types
  @Field(Types.Int) public intField: Number;
  @Field(Types.NonNullable(Types.Int))
  public intFieldNonNullable: Number;

  // Self Types
  @Field(AllTheThings) public selfType: AllTheThings;
  @Field(Types.NonNullable(AllTheThings))
  public selfTypeNonNullable: AllTheThings;
  @Field(Types.List(AllTheThings))
  public selfTypeList: AllTheThings[];
  @Field(Types.List(Types.NonNullable(AllTheThings)))
  public selfTypeNonNullableList: AllTheThings[];
  @Field(Types.NonNullable(Types.List(AllTheThings)))
  public selfTypeListNonNullable: AllTheThings[];
  @Field(Types.NonNullable(Types.List(Types.NonNullable(AllTheThings))))
  public selfTypeNonNullableListNonNullable: AllTheThings[];

  // AllTheThingsChild Types
  @Field(AllTheThingsChild) public postField: AllTheThingsChild;

  // Type with field name over-ride.
  @Field(Types.String, { name: 'new' })
  public newField: string;

  // String queries
  @Query(Types.String)
  stringQuery(): string {
    return 'hi';
  }

  @Query(Types.NonNullable(Types.String))
  stringQueryNonNullable(): string {
    return 'hi';
  }

  @Query(Types.List(Types.String))
  stringQueryList(): string[] {
    return ['hi'];
  }

  @Query(Types.NonNullable(Types.List(Types.String)))
  stringQueryListNonNullable(): string[] {
    return ['hi'];
  }

  // Int queries

  @Query(Types.Int)
  intQuery(): Number {
    return 1337;
  }

  @Query(Types.NonNullable(Types.Int))
  intQueryNonNullable(): Number {
    return 1337;
  }

  @Query(Types.List(Types.Int))
  intQueryList(): Number[] {
    return [1337];
  }

  @Query(Types.NonNullable(Types.List(Types.Int)))
  intQueryListNonNullable(): Number[] {
    return [1337];
  }

  // Self queries

  @Query(AllTheThings)
  selfQuery(): AllTheThings {
    return new AllTheThings();
  }

  @Query(Types.NonNullable(AllTheThings))
  selfQueryNonNullable(): AllTheThings {
    return new AllTheThings();
  }

  @Query(Types.List(AllTheThings))
  selfQueryList(): AllTheThings[] {
    return [new AllTheThings()];
  }

  @Query(Types.NonNullable(Types.List(AllTheThings)))
  selfQueryListNonNullable(): AllTheThings[] {
    return [new AllTheThings()];
  }

  // Other type queries

  @Query(AllTheThingsChild)
  otherTypeQuery(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Query(Types.NonNullable(AllTheThingsChild))
  otherTypeQueryNonNullable(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Query(Types.List(AllTheThingsChild))
  otherTypeQueryList(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  @Query(Types.NonNullable(Types.List(AllTheThingsChild)))
  otherTypeQueryListNonNullable(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  // @Mutation

  // String mutations

  @Mutation(Types.String)
  stringMutation(): string {
    return 'hi';
  }

  @Mutation(Types.NonNullable(Types.String))
  stringMutationNonNullable(): string {
    return 'hi';
  }

  @Mutation(Types.List(Types.String))
  stringMutationList(): string[] {
    return ['hi'];
  }

  @Mutation(Types.NonNullable(Types.List(Types.String)))
  stringMutationListNonNullable(): string[] {
    return ['hi'];
  }

  // Int mutations

  @Mutation(Types.Int)
  intMutation(): Number {
    return 1337;
  }

  @Mutation(Types.NonNullable(Types.Int))
  intMutationNonNullable(): Number {
    return 1337;
  }

  @Mutation(Types.List(Types.Int))
  intMutationList(): Number[] {
    return [1337];
  }

  @Mutation(Types.NonNullable(Types.List(Types.Int)))
  intMutationListNonNullable(): Number[] {
    return [1337];
  }

  // Self mutations

  @Mutation(AllTheThings)
  selfMutation(): AllTheThings {
    return new AllTheThings();
  }

  @Mutation(Types.NonNullable(AllTheThings))
  selfMutationNonNullable(): AllTheThings {
    return new AllTheThings();
  }

  @Mutation(Types.List(AllTheThings))
  selfMutationList(): AllTheThings[] {
    return [new AllTheThings()];
  }

  @Mutation(Types.NonNullable(Types.List(AllTheThings)))
  selfMutationListNonNullable(): AllTheThings[] {
    return [new AllTheThings()];
  }

  // Other type mutations

  @Mutation(AllTheThingsChild)
  otherTypeMutation(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Mutation(Types.NonNullable(AllTheThingsChild))
  otherTypeMutationNonNullable(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Mutation(Types.List(AllTheThingsChild))
  otherTypeMutationList(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  @Mutation(Types.NonNullable(Types.List(AllTheThingsChild)))
  otherTypeMutationListNonNullable(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }
}

export const expectedTypes = {
  AllTheThings: dedent`
    type AllTheThings {
      idField: ID
      idFieldNonNullable: ID!
      idFieldList: [ID]
      idFieldListNonNullable: [ID]!
      idFieldNonNullableListNonNullable: [ID!]!
      stringField: String
      stringFieldNonNullable: String!
      intField: Int
      intFieldNonNullable: Int!
      selfType: AllTheThings
      selfTypeNonNullable: AllTheThings!
      selfTypeList: [AllTheThings]
      selfTypeNonNullableList: [AllTheThings!]
      selfTypeListNonNullable: [AllTheThings]!
      selfTypeNonNullableListNonNullable: [AllTheThings!]!
      postField: AllTheThingsChild
      new: String
    }`,
  AllTheThingsChild: dedent`
    type AllTheThingsChild {
      id: ID
      title: String
    }`,
  Query: dedent`
    type Query {
      stringQuery: String
      stringQueryNonNullable: String!
      stringQueryList: [String]
      stringQueryListNonNullable: [String]!
      intQuery: Int
      intQueryNonNullable: Int!
      intQueryList: [Int]
      intQueryListNonNullable: [Int]!
      selfQuery: AllTheThings
      selfQueryNonNullable: AllTheThings!
      selfQueryList: [AllTheThings]
      selfQueryListNonNullable: [AllTheThings]!
      otherTypeQuery: AllTheThingsChild
      otherTypeQueryNonNullable: AllTheThingsChild!
      otherTypeQueryList: [AllTheThingsChild]
      otherTypeQueryListNonNullable: [AllTheThingsChild]!
    }`,
  Mutation: dedent`
    type Mutation {
      stringMutation: String
      stringMutationNonNullable: String!
      stringMutationList: [String]
      stringMutationListNonNullable: [String]!
      intMutation: Int
      intMutationNonNullable: Int!
      intMutationList: [Int]
      intMutationListNonNullable: [Int]!
      selfMutation: AllTheThings
      selfMutationNonNullable: AllTheThings!
      selfMutationList: [AllTheThings]
      selfMutationListNonNullable: [AllTheThings]!
      otherTypeMutation: AllTheThingsChild
      otherTypeMutationNonNullable: AllTheThingsChild!
      otherTypeMutationList: [AllTheThingsChild]
      otherTypeMutationListNonNullable: [AllTheThingsChild]!
    }`,
};
