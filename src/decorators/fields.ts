import { addFieldToObjectTypeMetadata } from '../metadata';
import { isStatic } from '../utilities/isStatic';
import { GraphQLPartyType } from '../types';

interface FieldOpts {
  name?: string;
  resolve?: Function;
  description?: string;
}

export function Field(type: GraphQLPartyType, opts: FieldOpts = {}): Function {
  return function(
    target: any,
    propertyOrMethodName: string,
    descriptor: any
  ): void {
    const fieldName = opts.name || propertyOrMethodName;

    if (isStatic(target, propertyOrMethodName)) {
      throw new Error('Static fields are not supported for @Field.');
    }

    addFieldToObjectTypeMetadata(target, fieldName, type, {
      descriptor,
      propertyOrMethodName: propertyOrMethodName,
      isStaticFunction: false,
      resolve: opts.resolve,
      description: opts.description,
    });
  };
}
