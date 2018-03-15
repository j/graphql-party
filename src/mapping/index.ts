import { ClassMetadataLoader } from './ClassMetadataLoader';
import { ClassMetadataFactory } from './ClassMetadataFactory';

export { ClassMetadata } from './ClassMetadata';
export { ClassMetadataLoader } from './ClassMetadataLoader';
export { ClassMetadataFactory, MetadataTypes } from './ClassMetadataFactory';

export const loaders = {
  objectType: ClassMetadataLoader.createLoaderForObjectTypes(),
  query: ClassMetadataLoader.createLoaderForQueries(),
  mutation: ClassMetadataLoader.createLoaderForMutations(),
};

export const factories = {
  objectType: new ClassMetadataFactory(loaders.objectType),
  query: new ClassMetadataFactory(loaders.query),
  mutation: new ClassMetadataFactory(loaders.mutation),
};
