import 'reflect-metadata';
import { isType, GraphQLType } from 'graphql';
import { WrappedType, resolveWrappedType } from '../utilities/wrappedType';
import { getObjectTypeMetadata } from './index';

export interface MetadataFieldOpts {
  args?: { [argument: string]: GraphQLType | WrappedType | Object };
  resolve?: Function;
  methodName?: string;
  propertyName?: string;
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

  computeArgs(): { [argument: string]: any } | null {
    const opts = this.opts;

    if (!opts || !opts.args || !Object.keys(opts.args).length) {
      return null;
    }

    let args = {};

    Object.keys(opts.args).forEach(arg => {
      args[arg] = { type: this.computeType(opts.args[arg], arg) };
    });

    return args;
  }

  computeType(type, name) {
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
