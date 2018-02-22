import { addFieldParamMetadata } from '../metadata/index';

function paramDecoratorFactory(
  type: string,
  field?: string
): ParameterDecorator {
  return function(target: Object, methodName: string, parameterIndex: number) {
    addFieldParamMetadata(target, methodName, {
      type,
      parameterIndex,
      field,
    });
  };
}

export function Arg(field?: string) {
  return paramDecoratorFactory('@Arg', field);
}

export function Context(field?: string) {
  return paramDecoratorFactory('@Context', field);
}
