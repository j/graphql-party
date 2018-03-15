import { ClassMetadata } from './ClassMetadata';
import {
  OBJECT_TYPE_METADATA_KEY,
  QUERY_METADATA_KEY,
  MUTATION_METADATA_KEY,
} from './classMetadataKeys';

export class ClassMetadataLoader {
  public isObjectTypeLoader: boolean = false;
  public isQueryLoader: boolean = false;
  public isMutationLoader: boolean = false;

  constructor(public metadataKey: Symbol) {
    switch (metadataKey) {
      case OBJECT_TYPE_METADATA_KEY:
        this.isObjectTypeLoader = true;
        break;
      case QUERY_METADATA_KEY:
        this.isQueryLoader = true;
        break;
      case MUTATION_METADATA_KEY:
        this.isMutationLoader = true;
        break;
      default:
        throw new Error(
          `ClassMetadataLoader for key "${metadataKey}" is not supported.`
        );
    }
  }

  /**
   * Gets or creates the metadata for "Class".
   */
  loadMetadata(target): ClassMetadata {
    return Reflect.getOwnMetadata(this.metadataKey, target);
  }

  /**
   * Gets or creates the metadata for "Class".
   */
  loadOrCreateMetadata(target): ClassMetadata {
    let metadata = Reflect.getOwnMetadata(this.metadataKey, target);

    if (!metadata) {
      metadata = new ClassMetadata();
      metadata.target = target;
      metadata.key = this.metadataKey;

      Reflect.defineMetadata(this.metadataKey, metadata, target);
    }

    return metadata;
  }

  /**
   *
   * Factory Methods.
   *
   */

  static createLoaderForObjectTypes() {
    return new ClassMetadataLoader(OBJECT_TYPE_METADATA_KEY);
  }

  static createLoaderForQueries() {
    return new ClassMetadataLoader(QUERY_METADATA_KEY);
  }

  static createLoaderForMutations() {
    return new ClassMetadataLoader(MUTATION_METADATA_KEY);
  }
}
