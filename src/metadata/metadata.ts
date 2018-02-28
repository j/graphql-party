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
import { ParamTypes } from '../decorators/params';
import { GraphQLPartyType } from '../types';
import { getFromContainer } from '../container';

export interface GraphQLObjectOrInputTypeCtor {
  new (
    config: GraphQLObjectTypeConfig<any, any> | GraphQLInputObjectTypeConfig
  ): GraphQLObjectType | GraphQLInputObjectType;
}

export interface MetadataParam {
  paramType: ParamTypes;
  paramIndex: number;
  field?: string;
  type?: GraphQLPartyType;
}

function getArg(oldArgs: any[], index: number, field?): any {
  if (!oldArgs || typeof oldArgs[index] === 'undefined') {
    return null;
  }

  if (!field) {
    return oldArgs[index];
  }

  return typeof oldArgs[index][field] !== 'undefined'
    ? oldArgs[index][field]
    : null;
}

function getArgs(field, origArgs) {
  const params = field.getParams();

  let args: any[] = origArgs;

  if (params.length) {
    const oldArgs = args;

    args = [];

    params.forEach(({ paramType, paramIndex, field }) => {
      switch (paramType) {
        case ParamTypes.Arg:
          args[paramIndex] = getArg(oldArgs, 1, field);
          break;
        case ParamTypes.Context:
          args[paramIndex] = getArg(oldArgs, 2, field);
          break;
      }
    });
  }

  return [...args, ...origArgs];
}

function getResolverForField(field: MetadataField): Function | undefined {
  const opts = field.getOpts() || {};

  const resolver =
    opts.resolve || (opts.descriptor ? opts.descriptor.value : undefined);

  // no need for a resolver if it's not a function or there are no params
  if (!resolver && !field.getParams().length) {
    return undefined;
  }

  const resolverTargetInstance = field.getResolverTargetInstance();

  return function(...args): any {
    return resolver.apply(
      resolverTargetInstance || args[0],
      getArgs(field, args)
    );
  };
}

function getResolverForQueryOrMutation(
  meta: Metadata,
  field: MetadataField
): Function | undefined {
  const instance = field.isResolverStaticFunction()
    ? meta.getTarget()
    : meta.getTargetInstance();

  return function(...args): any {
    return instance[field.getOpts().propertyOrMethodName].apply(
      instance,
      getArgs(field, args)
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
  private description?: string;

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
    this.Type = GraphQLObjectType;
    this.fields = {};
    this.name = undefined;
    this.objectType = undefined;
    this.description = undefined;

    Reflect.defineMetadata(key, this, target);
  }

  isInputType() {
    return this.Type === GraphQLInputObjectType;
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

  getKey(): Symbol {
    return this.key;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getDescription(): string | undefined {
    return this.description;
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
        description: field.getDescription(),
      };

      let resolve: Function | undefined = undefined;

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
    return getFromContainer(this.target);
  }

  createType(fields: any): GraphQLObjectType | GraphQLInputObjectType {
    this.objectType = new this.Type({
      name: this.getName(),
      description: this.getDescription(),
      fields,
    });

    return this.objectType;
  }
}
