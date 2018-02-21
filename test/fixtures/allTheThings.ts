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

  @Field(AllTheThings, {
    resolve: (allTheThings): AllTheThings => allTheThings.selfTypeList[0],
  })
  public firstSelfTypeList: AllTheThings;

  // AllTheThingsChild Types
  @Field(AllTheThingsChild) public childField: AllTheThingsChild;

  // Type with field name over-ride.
  @Field(Types.String, { name: 'new' })
  public newField: string;

  // String queries
  @Query(Types.String)
  static stringQuery(): string {
    return 'hi';
  }

  @Query(Types.NonNullable(Types.String))
  static stringQueryNonNullable(): string {
    return 'hi';
  }

  @Query(Types.List(Types.String))
  static stringQueryList(): string[] {
    return ['hi'];
  }

  @Query(Types.NonNullable(Types.List(Types.String)))
  static stringQueryListNonNullable(): string[] {
    return ['hi'];
  }

  // Int queries

  @Query(Types.Int)
  static intQuery(): Number {
    return 1337;
  }

  @Query(Types.NonNullable(Types.Int))
  static intQueryNonNullable(): Number {
    return 1337;
  }

  @Query(Types.List(Types.Int))
  static intQueryList(): Number[] {
    return [1337];
  }

  @Query(Types.NonNullable(Types.List(Types.Int)))
  static intQueryListNonNullable(): Number[] {
    return [1337];
  }

  // Self queries

  @Query(AllTheThings)
  static selfQuery(): AllTheThings {
    return new AllTheThings();
  }

  @Query(Types.NonNullable(AllTheThings))
  static selfQueryNonNullable(): AllTheThings {
    return new AllTheThings();
  }

  @Query(Types.List(AllTheThings))
  static selfQueryList(): AllTheThings[] {
    return [new AllTheThings()];
  }

  @Query(Types.NonNullable(Types.List(AllTheThings)))
  static selfQueryListNonNullable(): AllTheThings[] {
    return [new AllTheThings()];
  }

  // Other type queries

  @Query(AllTheThingsChild)
  static otherTypeQuery(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Query(Types.NonNullable(AllTheThingsChild))
  static otherTypeQueryNonNullable(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Query(Types.List(AllTheThingsChild))
  static otherTypeQueryList(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  @Query(Types.NonNullable(Types.List(AllTheThingsChild)))
  static otherTypeQueryListNonNullable(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  // @Mutation

  // String mutations

  @Mutation(Types.String)
  static stringMutation(): string {
    return 'hi';
  }

  @Mutation(Types.NonNullable(Types.String))
  static stringMutationNonNullable(): string {
    return 'hi';
  }

  @Mutation(Types.List(Types.String))
  static stringMutationList(): string[] {
    return ['hi'];
  }

  @Mutation(Types.NonNullable(Types.List(Types.String)))
  static stringMutationListNonNullable(): string[] {
    return ['hi'];
  }

  // Int mutations

  @Mutation(Types.Int)
  static intMutation(): Number {
    return 1337;
  }

  @Mutation(Types.NonNullable(Types.Int))
  static intMutationNonNullable(): Number {
    return 1337;
  }

  @Mutation(Types.List(Types.Int))
  static intMutationList(): Number[] {
    return [1337];
  }

  @Mutation(Types.NonNullable(Types.List(Types.Int)))
  static intMutationListNonNullable(): Number[] {
    return [1337];
  }

  // Self mutations

  @Mutation(AllTheThings)
  static selfMutation(): AllTheThings {
    return new AllTheThings();
  }

  @Mutation(Types.NonNullable(AllTheThings))
  static selfMutationNonNullable(): AllTheThings {
    return new AllTheThings();
  }

  @Mutation(Types.List(AllTheThings))
  static selfMutationList(): AllTheThings[] {
    return [new AllTheThings()];
  }

  @Mutation(Types.NonNullable(Types.List(AllTheThings)))
  static selfMutationListNonNullable(): AllTheThings[] {
    return [new AllTheThings()];
  }

  // Other type mutations

  @Mutation(AllTheThingsChild)
  static otherTypeMutation(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Mutation(Types.NonNullable(AllTheThingsChild))
  static otherTypeMutationNonNullable(): AllTheThingsChild {
    return new AllTheThingsChild();
  }

  @Mutation(Types.List(AllTheThingsChild))
  static otherTypeMutationList(): AllTheThingsChild[] {
    return [new AllTheThingsChild()];
  }

  @Mutation(Types.NonNullable(Types.List(AllTheThingsChild)))
  static otherTypeMutationListNonNullable(): AllTheThingsChild[] {
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
      firstSelfTypeList: AllTheThings
      childField: AllTheThingsChild
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
