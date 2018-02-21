import * as graphql from 'graphql';
import { addFieldToObjectTypeMetadata } from '../metadata';
import { WrappedType } from '../utilities/wrappedType';

interface FieldOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
  resolve?: Function;
}

export function Field(
  type: graphql.GraphQLType | WrappedType | Object,
  opts?: FieldOpts
): Function {
  return function(target: any, propertyName: string): void {
    const fieldName = opts && opts.name ? opts.name : propertyName;

    addFieldToObjectTypeMetadata(target.constructor, fieldName, type, {
      propertyName,
      args: opts && opts.args ? opts.args : undefined,
      resolve: opts && opts.resolve ? opts.resolve : undefined,
    });
  };
}
