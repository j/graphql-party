import { addMutationField } from '../metadata';
import { isStaticFunction } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

interface MutationOpts {
  name?: string;
  description?: string;
}

export function Mutation(
  type: GraphQLPartyType,
  opts: MutationOpts = {}
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    addMutationField(target, fieldName, type, {
      descriptor,
      methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      description: opts.description,
    });
  };
}
