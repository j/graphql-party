import { addFieldParamMetadata } from '../metadata/index';
import { GraphQLPartyType } from '../types';

export enum ParamTypes {
  Arg = '@Arg',
  Context = '@Context',
}

function paramDecoratorFactory(
  paramType: ParamTypes,
  field?: string,
  type?: GraphQLPartyType
): ParameterDecorator {
  return function(target: Object, methodName: string, paramIndex: number) {
    addFieldParamMetadata(target, methodName, {
      paramType,
      paramIndex,
      field,
      type,
    });
  };
}

export function Arg(field: string, type: GraphQLPartyType) {
  if (!type || !field) {
    throw new Error('@Arg() requires "type" and "field".');
  }

  return paramDecoratorFactory(ParamTypes.Arg, field, type);
}

export function Context(field?: string) {
  return paramDecoratorFactory(ParamTypes.Context, field);
}
