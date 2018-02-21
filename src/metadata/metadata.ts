import 'reflect-metadata';
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLObjectTypeConfig,
  GraphQLInputObjectTypeConfig,
} from 'graphql';
import {
  OBJECT_TYPE_KEY,
  OBJECT_QUERY_TYPE_KEY,
  OBJECT_MUTATION_TYPE_KEY,
  MetadataField,
} from './index';

export interface GraphQLObjectOrInputTypeCtor {
  new (
    config: GraphQLObjectTypeConfig<any, any> | GraphQLInputObjectTypeConfig
  ): GraphQLObjectType | GraphQLInputObjectType;
}

function getResolverForField(field: MetadataField): Function | null {
  const descriptor = field.getDescriptor();

  if (!descriptor) {
    return null;
  }

  return function(): any {
    const resolveArgs = Object.values(arguments);

    return descriptor.value.apply(resolveArgs.shift(), resolveArgs);
  };
}

function getResolverForQueryOrMutation(
  meta: Metadata,
  field: MetadataField
): Function | null {
  const instance = meta.getTargetInstance();

  return function(): any {
    return instance[field.getOpts().methodName].apply(
      instance,
      Object.values(arguments)
    );
  };
}

export class Metadata {
  private target: any;
  private key: Symbol;
  private name: string;
  private Type: GraphQLObjectOrInputTypeCtor;
  private objectType: GraphQLObjectType | GraphQLInputObjectType;
  private fields: { [fieldName: string]: MetadataField };
  private instance?: Object;
  private targetInstanceArgs?: any;

  public static getOrCreateInstance(
    target: any,
    key: Symbol = OBJECT_TYPE_KEY
  ) {
    const found = Reflect.getMetadata(key, target);

    if (found) {
      return found;
    }

    return new Metadata(target, key);
  }

  constructor(target: any, key: Symbol = OBJECT_TYPE_KEY) {
    this.target = target;
    this.key = key;
    this.name = null;
    this.Type = GraphQLObjectType;
    this.objectType = null;
    this.fields = {};
    this.targetInstanceArgs = [];

    Reflect.defineMetadata(key, this, target);
  }

  isQueryOrMutation() {
    return this.isQuery() || this.isMutation();
  }

  isQuery() {
    return this.key === OBJECT_QUERY_TYPE_KEY;
  }

  isMutation() {
    return this.key === OBJECT_MUTATION_TYPE_KEY;
  }

  getTarget(): any {
    return this.target;
  }

  setTargetInstanceAgs(args: any[]) {
    this.targetInstanceArgs = args;
  }

  getKey(): Symbol {
    return this.key;
  }

  setName(name: string): void {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setType(Type: GraphQLObjectOrInputTypeCtor): void {
    this.Type = Type;
  }

  getType(): GraphQLObjectOrInputTypeCtor {
    return this.Type;
  }

  setObjectType(objectType: GraphQLObjectType | GraphQLInputObjectType) {
    this.objectType = objectType;
  }

  getObjectType(): GraphQLObjectType | GraphQLInputObjectType {
    return this.objectType;
  }

  addField(field: MetadataField): void {
    this.fields[field.getFieldName()] = field;
  }

  getField(fieldName: string): MetadataField {
    return this.fields[fieldName];
  }

  hasField(fieldName: string): boolean {
    return typeof this.fields[fieldName] !== 'undefined';
  }

  getFields(): { [fieldName: string]: MetadataField } {
    return this.fields;
  }

  computeFields() {
    const fields = {};

    Object.values(this.getFields()).forEach(field => {
      const fieldName = field.getFieldName();

      fields[fieldName] = {
        type: field.computeType(field.getType(), fieldName),
        args: field.computeArgs(),
      };

      let resolve: Function | null = null;

      if (this.isQueryOrMutation()) {
        resolve = getResolverForQueryOrMutation(this, field);
      } else {
        resolve = getResolverForField(field);
      }

      if (resolve) {
        fields[fieldName].resolve = resolve;
      }
    });

    return fields;
  }

  getTargetInstance(): Object {
    if (!this.instance) {
      this.instance = new this.target(...this.targetInstanceArgs);
    }

    return this.instance;
  }

  createType(fields: any): GraphQLObjectType | GraphQLInputObjectType {
    this.objectType = new this.Type({ name: this.getName(), fields });

    return this.objectType;
  }
}
