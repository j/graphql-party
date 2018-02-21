import * as graphql from 'graphql';
import { addMutationField } from '../metadata';
import { WrappedType } from '../utilities/wrappedType';
import { isStaticFunction } from '../utilities/isStatic';

interface MutationOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
  description?: string;
}

export function Mutation(
  type: graphql.GraphQLType | WrappedType | Object,
  opts: MutationOpts = {}
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts.name || methodName;

    addMutationField(target, fieldName, type, {
      methodName,
      isStaticFunction: isStaticFunction(target, methodName, descriptor),
      args: opts.args,
      description: opts.description,
    });
  };
}
