import * as graphql from 'graphql';
import { addFieldToObjectTypeMetadata } from '../metadata';
import { WrappedType } from '../wrappedType';

interface FieldOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
}

export function Field(
  type: graphql.GraphQLType | WrappedType | Object,
  opts?: FieldOpts
): Function {
  return function(target: any, propertyName: string, descriptor: any): void {
    const fieldName = opts && opts.name ? opts.name : propertyName;

    addFieldToObjectTypeMetadata(
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
