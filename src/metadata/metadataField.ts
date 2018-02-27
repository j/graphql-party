import 'reflect-metadata';
import { isType, GraphQLType } from 'graphql';
import { WrappedType, resolveWrappedType } from '../utilities/wrappedType';
import { getObjectTypeMetadata } from './index';
import { MetadataParam } from './metadata';
import { ParamTypes } from '../decorators/params';
import { GraphQLPartyType } from '../types';
import { getFromContainer } from '../container';

export interface MetadataFieldOpts {
  resolve?: Function;
  isStaticFunction?: boolean;
  resolverTarget?: any;
  descriptor?: any;
  propertyOrMethodName?: string;
  description?: string;
}

export class MetadataField {
  constructor(
    private fieldName: string,
    private type: GraphQLPartyType,
    private opts?: MetadataFieldOpts,
    private params?: MetadataParam[]
  ) {}

  getFieldName(): string {
    return this.fieldName;
  }

  setType(type: GraphQLPartyType): void {
    this.type = type;
  }

  getType(): GraphQLPartyType {
    return this.type;
  }

  setOpts(opts: MetadataFieldOpts): void {
    this.opts = opts;
  }

  getOpts(): MetadataFieldOpts {
    return this.opts;
  }

  setParams(params: MetadataParam[]): void {
    this.params = params || [];
  }

  getParams(): MetadataParam[] {
    return this.params || [];
  }

  getDescription(): string {
    return this.opts && this.opts.description
      ? this.opts.description
      : undefined;
  }

  getResolverTargetInstance(): Object {
    return this.opts.resolverTarget
      ? getFromContainer(this.opts.resolverTarget)
      : undefined;
  }

  isResolverStaticFunction() {
    return this.opts.isStaticFunction === true;
  }

  computeArgs(): { [argument: string]: any } | undefined {
    const args = {};
    let startsAtZero = false;
    let invalidOrder = false;
    let wasNonArg = false;

    const params = this.getParams();

    for (let i = 0; i < params.length; i++) {
      if (!params[i]) {
        wasNonArg = true;
        continue;
      }

      const { paramType, paramIndex, field, type } = params[i];

      if (paramType === ParamTypes.Arg) {
        if (paramIndex === 0) {
          startsAtZero = true;
        } else if (wasNonArg) {
          invalidOrder = true;
        }

        args[field] = { type: this.computeType(type, field) };
      } else {
        wasNonArg = true;
      }
    }

    // @Arg() must be the first param.
    if (!startsAtZero) {
      invalidOrder = true;
    }

    const hasArgs = Object.keys(args).length > 0;

    // @Arg must be defined before any other parameter.
    if (hasArgs && invalidOrder) {
      throw new Error(
        `@Arg must be declared before any other parameter in "${this.getFieldName()}".`
      );
    }

    return hasArgs ? args : undefined;
  }

  /**
   * Creates a field's GraphQLType.
   */
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
