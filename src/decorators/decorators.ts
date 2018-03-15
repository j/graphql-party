import { GraphQLPartyType } from '../types';
import { loaders, ClassMetadataLoader } from '../mapping';

export interface CommonOpts {
  name?: string;
  description?: string;
}

export function ObjectType(opts: CommonOpts) {
  return createClassDecorator(opts);
}

export function Field(type: GraphQLPartyType, opts: CommonOpts = {}) {
  return createFieldDecorator(type, opts);
}

export function Query(type: GraphQLPartyType, opts: CommonOpts = {}) {
  return createFieldDecorator(type, opts, loaders.query);
}

export function Mutation(type: GraphQLPartyType, opts: CommonOpts = {}) {
  return createFieldDecorator(type, opts, loaders.mutation);
}

export function Use(plugin: Function): ClassDecorator {
  return (target: Object): void => {
    const metadata = loaders.query.loadOrCreateMetadata(target);
    metadata.target = target;
    metadata.plugins.push(plugin);
  };
}

const createFieldDecorator = (
  type: GraphQLPartyType,
  opts: CommonOpts = {},
  loader: ClassMetadataLoader = loaders.objectType
): PropertyDecorator | MethodDecorator => (
  target: Object,
  key: string | symbol,
  descriptor: PropertyDescriptor
): void => {
  if (<any>key instanceof Symbol) {
    throw new Error('Symbols are not supported for fields.');
  }

  const metadata = loader.loadOrCreateMetadata(target.constructor);

  metadata.fields.push({
    type,
    key,
    name: opts.name || <string>key,
    description: opts.description,
  });
};

const createClassDecorator = (opts: CommonOpts = {}): ClassDecorator => (
  target: any
): void => {
  const metadata = loaders.objectType.loadOrCreateMetadata(target);

  metadata.name = opts.name ? opts.name : target.name;
  metadata.description = opts.description ? opts.description : undefined;
};
