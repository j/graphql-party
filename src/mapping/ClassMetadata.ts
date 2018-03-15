import {
  GraphQLObjectType,
  GraphQLFieldMap,
  GraphQLInputFieldMap,
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLType,
} from 'graphql';
import { GraphQLPartyType } from '../types';
import { getFromContainer } from '../container';
import {
  OBJECT_TYPE_METADATA_KEY,
  QUERY_METADATA_KEY,
  MUTATION_METADATA_KEY,
} from './classMetadataKeys';

type ValidGraphQLType = GraphQLObjectType | GraphQLInputType;

export const CLASS_METADATA_KEY = Symbol('ClassMetadata');

export interface FieldMetadata {
  /**
   * The property/method name.
   */
  key: string | symbol;

  /**
   * The GraphQL field's name.
   */
  name: string;

  /**
   * The GraphQL field's description.
   */
  description: string;

  /**
   * The field's type.
   */
  type: GraphQLPartyType;
}

export class ClassMetadata {
  /**
   * The key used for reflect-metadata.
   */
  public key: symbol;

  /**
   * The main class that has metadata associated to it.
   */
  public target: any;

  /**
   * The instantiated "target".
   */
  private targetInstance?: Object;

  /**
   * The class it extends.
   */
  public parent?: ClassMetadata;

  /**
   * Plugins for the class.
   */
  public plugins: Function[] = [];

  /**
   * The GraphQL type's name.
   */
  public name: string;

  /**
   * The GraphQL type's description.
   */
  public description: string;

  /**
   * The metadata to instruct how to create the proper fields containing GraphQLType.
   */
  public fields: FieldMetadata[] = [];

  /**
   * Fields that have a function as it's argument
   */
  public deferredFields: Function[] = [];

  /**
   * The type to be created for the GraphQL schema.
   */
  public GraphQLType: { new (...props): ValidGraphQLType } = GraphQLObjectType;

  /**
   * The created fields for the GraphQLType.
   */
  public graphqlFields?: GraphQLFieldMap<any, any> | GraphQLInputFieldMap;

  /**
   * The created GraphQL type.
   */
  public type?: ValidGraphQLType;

  /**
   * Gets or creates the instance for "target".
   */
  instance() {
    if (!this.targetInstance) {
      this.targetInstance = getFromContainer(this.target);
    }

    return this.targetInstance;
  }

  isObjectType() {
    return this.key === OBJECT_TYPE_METADATA_KEY;
  }

  isQuery() {
    return this.key === QUERY_METADATA_KEY;
  }

  isMutation() {
    return this.key === MUTATION_METADATA_KEY;
  }

  setGraphQLTypeInstance(
    fields: GraphQLFieldMap<any, any> | GraphQLInputFieldMap
  ) {
    switch (this.GraphQLType) {
      case GraphQLObjectType:
        this.type = new this.GraphQLType({
          name: this.name,
          description: this.description,
          fields: fields as GraphQLFieldMap<any, any>,
        }) as GraphQLObjectType;

        break;
      case GraphQLInputObjectType:
        this.type = new this.GraphQLType({
          name: this.name,
          description: this.description,
          fields: fields as GraphQLInputFieldMap,
        }) as GraphQLInputObjectType;

        break;
      default:
        throw new Error('Invalid GraphQL type for ClassMetadata.');
    }
  }
}
