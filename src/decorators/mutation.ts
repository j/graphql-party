import { addMutationField } from '../metadata';
import { isStaticFunction } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

export interface MutationOpts {
  name?: string;
  description?: string;
}

export function Mutation(
  type: GraphQLPartyType,
  opts: MutationOpts = {}
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    if (!descriptor) {
      throw new Error('@Mutation must be a valid function.');
    }

    addMutationField(target, fieldName, type, {
      descriptor,
      propertyOrMethodName: methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      description: opts.description,
    });
  };
}
