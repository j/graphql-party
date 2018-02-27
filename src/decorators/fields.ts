import { addFieldToObjectTypeMetadata } from '../metadata';
import { isStaticProperty } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

interface FieldOpts {
  name?: string;
  resolve?: Function;
  description?: string;
}

export function Field(type: GraphQLPartyType, opts: FieldOpts = {}): Function {
  return function(target: any, propertyName: string, descriptor: any): void {
    const fieldName = opts.name || propertyName;

    if (isStaticProperty(target, propertyName)) {
      throw new Error('Static properties are not supported for @Field.');
    }

    addFieldToObjectTypeMetadata(target, fieldName, type, {
      descriptor,
      propertyName,
      isStaticFunction: false,
      resolve: opts.resolve,
      description: opts.description,
    });
  };
}
