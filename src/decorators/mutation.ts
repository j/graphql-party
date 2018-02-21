import * as graphql from 'graphql';
import { addMutationField } from '../metadata';
import { WrappedType } from '../utilities/wrappedType';

interface MutationOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
}

export function Mutation(
  type: graphql.GraphQLType | WrappedType | Object,
  opts?: MutationOpts
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts && opts.name ? opts.name : methodName;

    addMutationField(
      target.constructor,
      fieldName,
      type,
      {
        methodName,
        args: opts && opts.args ? opts.args : undefined,
      },
      descriptor
    );
  };
}
