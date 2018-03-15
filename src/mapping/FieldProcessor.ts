import { GraphQLType, isType } from 'graphql';
import { resolveWrappedType, WrappedType } from '../utilities/wrappedType';
import { ClassMetadataFactory } from './ClassMetadataFactory';
import { ClassMetadata, FieldMetadata } from './ClassMetadata';
import { factories } from './';

export class FieldProcessor {
  constructor(public factory: ClassMetadataFactory) {}

  processFields(metadata: ClassMetadata, rootMetadata?: ClassMetadata) {
    if (!metadata) {
      return {};
    }

    rootMetadata = rootMetadata || metadata;

    let fields = {};

    metadata.fields.forEach(field => {
      fields[field.name] = this.processField(field);
    });

    if (metadata.plugins && metadata.plugins.length) {
      metadata.plugins.forEach(plugin => {
        const PluginClass = plugin(rootMetadata.instance());
        const pluginMetadata = this.factory.loadMetadataFor(PluginClass);
        const pluginFields = this.processFields(pluginMetadata, rootMetadata);

        fields = { ...fields, ...pluginFields };
      });
    }

    return fields;
  }

  private processField(field: FieldMetadata) {
    return {
      type: this.processFieldType(field.type, field.name),
      description: field.description,
    };
  }

  /**
   * Creates a field's GraphQLType.
   */
  private processFieldType(type, name): GraphQLType {
    if (isType(type)) {
      return type;
    }

    if (type instanceof WrappedType) {
      return resolveWrappedType(type, name);
    }

    const metadata = factories.objectType.loadMetadataFor(type);

    if (!metadata && !metadata.type) {
      throw new Error(
        `ObjectType for ${name} is not a valid GraphQLObjectType.`
      );
    }

    return metadata.type;
  }
}
