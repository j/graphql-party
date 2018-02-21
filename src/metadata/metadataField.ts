import 'reflect-metadata';
import {
  isType,
  GraphQLType,
  GraphQLObjectType,
  GraphQLInputObjectType,
} from 'graphql';
import { WrappedType, resolveWrappedType } from '../utilities/wrappedType';
import { getObjectTypeMetadata } from './index';

export interface MetadataFieldOpts {
  args?: { [argument: string]: GraphQLType | WrappedType | Object };
  resolve?: Function;
  isStaticFunction?: boolean;
  methodName?: string;
  propertyName?: string;
  description?: string;
}

export class MetadataField {
  constructor(
    private fieldName: string,
    private type: GraphQLType | WrappedType | Object,
    private opts?: MetadataFieldOpts
  ) {}

  getFieldName(): string {
    return this.fieldName;
  }

  getType(): GraphQLType | WrappedType | Object {
    return this.type;
  }

  getOpts(): MetadataFieldOpts {
    return this.opts;
  }

  getDescription(): string {
    return this.opts && this.opts.description
      ? this.opts.description
      : undefined;
  }

  isResolverStaticFunction() {
    return this.opts.isStaticFunction === true;
  }

  computeArgs(): { [argument: string]: any } | undefined {
    const opts = this.opts;

    if (!opts || !opts.args || !Object.keys(opts.args).length) {
      return undefined;
    }

    let args = {};

    Object.keys(opts.args).forEach(arg => {
      args[arg] = { type: this.computeType(opts.args[arg], arg) };
    });

    return args;
  }

  computeType(type, name): GraphQLType {
    if (isType(type)) {
      return type;
    }

    if (type instanceof WrappedType) {
      return resolveWrappedType(type, name);
    }

    const objectTypeMeta = getObjectTypeMetadata(type);

    if (!objectTypeMeta || !objectTypeMeta.getObjectType()) {
      throw new Error(
        `ObjectType for ${name} is not a valid GraphQLObjectType.`
      );
    }

    return objectTypeMeta.getObjectType();
  }
}
