import * as graphql from 'graphql';
import { addQueryField } from '../utilities/metadata';
import { WrappedType } from '../wrappedType';

interface QueryOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
}

export function Query(
  type: graphql.GraphQLType | WrappedType | Object,
  opts?: QueryOpts
): Function {
  return function(target: any, methodName: string, descriptor: any): void {
    const fieldName = opts && opts.name ? opts.name : methodName;

    addQueryField(
      target.constructor,
      fieldName,
      type,
      {
        args: opts && opts.args ? opts.args : undefined,
      },
      descriptor
    );
  };
}
