import * as graphql from 'graphql';
import { addQueryField } from '../metadata';
import { WrappedType } from '../utilities/wrappedType';
import { isStaticFunction } from '../utilities/isStatic';

interface QueryOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
  description?: string;
}

export function Query(
  type: graphql.GraphQLType | WrappedType | Object,
  opts: QueryOpts = {}
): Function {
  if (!type) {
    throw new Error('Query is missing a type.');
  }

  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    addQueryField(target, fieldName, type, {
      methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      args: opts.args,
      description: opts.description,
    });
  };
}
