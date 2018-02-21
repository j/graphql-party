import * as graphql from 'graphql';
import { addFieldToObjectTypeMetadata } from '../metadata';
import { WrappedType } from '../utilities/wrappedType';
import { isStaticProperty } from '../utilities/isStatic';

interface FieldOpts {
  name?: string;
  args?: { [argument: string]: graphql.GraphQLType | WrappedType | Object };
  resolve?: Function;
  description?: string;
}

export function Field(
  type: graphql.GraphQLType | WrappedType | Object,
  opts: FieldOpts = {}
): Function {
  return function(target: any, propertyName: string): void {
    const fieldName = opts.name || propertyName;

    if (isStaticProperty(target, propertyName)) {
      throw new Error('Static properties are not supported for @Field.');
    }

    addFieldToObjectTypeMetadata(target, fieldName, type, {
      propertyName,
      isStaticFunction: false,
      args: opts.args,
      resolve: opts.resolve,
      description: opts.description,
    });
  };
}
