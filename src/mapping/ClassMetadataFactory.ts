import { ClassMetadata } from './ClassMetadata';
import { ClassMetadataLoader } from './ClassMetadataLoader';
import { FieldProcessor } from './FieldProcessor';

export enum MetadataTypes {
  Query = 'Query',
  Mutation = 'Mutation',
}

export class ClassMetadataFactory {
  private fieldProcessor: FieldProcessor;

  constructor(public loader: ClassMetadataLoader, public type?: MetadataTypes) {
    this.fieldProcessor = new FieldProcessor(this);
  }

  loadMetadataFor(ClassWithMetadata: Object): ClassMetadata {
    return this.processMetadata(this.loader.loadMetadata(ClassWithMetadata));
  }

  processMetadata(metadata: ClassMetadata) {
    if (!metadata) {
      return;
    }

    this.attachParent(metadata.target, metadata);
    this.attachGraphQLFields(metadata);
    this.attachGraphQLType(metadata);

    return metadata;
  }

  /**
   * Sets up the metadata inheritance.
   */
  private attachParent(
    ClassWithMetadata: Object,
    metadata: ClassMetadata
  ): void {
    const parent = Object.getPrototypeOf(ClassWithMetadata);

    if (parent && typeof parent === 'function') {
      const parentMetadata = this.loadMetadataFor(parent);

      if (parentMetadata) {
        metadata.parent = parentMetadata;
      }
    }
  }

  /**
   * Sets the GraphQL type for the metadata.
   */
  private attachGraphQLFields(metadata: ClassMetadata) {
    if (!metadata.graphqlFields) {
      metadata.graphqlFields = this.fieldProcessor.processFields(metadata);
    }
  }

  /**
   * Sets the GraphQL type for the metadata.
   */
  private attachGraphQLType(metadata: ClassMetadata) {
    if (
      metadata.isObjectType() &&
      !metadata.type &&
      Object.keys(metadata.graphqlFields).length
    ) {
      metadata.setGraphQLTypeInstance(metadata.graphqlFields);
    }
  }
}
