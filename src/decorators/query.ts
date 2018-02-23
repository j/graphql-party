import { addQueryField } from '../metadata';
import { isStaticFunction } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

interface QueryOpts {
  name?: string;
  description?: string;
}

export function Query(type: GraphQLPartyType, opts: QueryOpts = {}): Function {
  if (!type) {
    throw new Error('Query is missing a type.');
  }

  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    addQueryField(target, fieldName, type, {
      methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      description: opts.description,
    });
  };
}
