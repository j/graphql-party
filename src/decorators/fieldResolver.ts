import { addFieldToObjectTypeMetadata } from '../metadata';
import { isStaticFunction } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

export interface FieldResolverOpts {
  name?: string;
  description?: string;
}

export function FieldResolver(
  ObjectTypeClass: any,
  type: GraphQLPartyType,
  opts: FieldResolverOpts = {}
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    if (!descriptor) {
      throw new Error('@FieldResolver must be a function.');
    }

    if (isStaticFunction(target, methodName, descriptor)) {
      throw new Error('Static @FieldResolver is not supported.');
    }

    addFieldToObjectTypeMetadata(ObjectTypeClass.prototype, fieldName, type, {
      descriptor,
      propertyOrMethodName: methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      resolverTarget: target,
      description: opts.description,
    });
  };
}
