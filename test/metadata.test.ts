import 'mocha';
import { assert } from 'chai';
import * as graphql from 'graphql';
import * as metadata from '../src/metadata';
import { GraphQLObjectType, GraphQLObjectTypeConfig } from 'graphql';
import { setInstance } from '../src/container';

describe('metadata', () => {
  describe('addFieldToObjectTypeMetadata()', () => {
    it('errors when there is a duplicate field', () => {
      class Animal {
        public name: string;
      }

      metadata.addFieldToObjectTypeMetadata(
        Animal,
        'name',
        (): graphql.GraphQLType => {
          return graphql.GraphQLString;
        }
      );

      assert.throw(() =>
        metadata.addFieldToObjectTypeMetadata(
          Animal,
          'name',
          (): graphql.GraphQLType => {
            return graphql.GraphQLInt;
          }
        )
      );
    });
  });

  describe('getQueryObjectTypeMetadata()', () => {
    it('returns existing meta', () => {
      class AnimalRepository {}
      const meta = metadata.getOrCreateObjectTypeMetadata(
        AnimalRepository,
        metadata.OBJECT_QUERY_TYPE_KEY
      );
      assert.isTrue(meta.isQuery());
      assert.equal(metadata.getQueryObjectTypeMetadata(AnimalRepository), meta);
    });

    it('returns undefined when defined as an object type', () => {
      class Animal {}
      metadata.getOrCreateObjectTypeMetadata(Animal);
      assert.isUndefined(metadata.getQueryObjectTypeMetadata(Animal));
    });

    it('returns undefined when defined as a mutation type', () => {
      class Animal {}
      metadata.getOrCreateObjectTypeMetadata(
        Animal,
        metadata.OBJECT_MUTATION_TYPE_KEY
      );
      assert.isUndefined(metadata.getQueryObjectTypeMetadata(Animal));
    });
  });

  describe('getMutationObjectTypeMetadata()', () => {
    it('returns existing meta', () => {
      class AnimalRepository {}
      const meta = metadata.getOrCreateObjectTypeMetadata(
        AnimalRepository,
        metadata.OBJECT_MUTATION_TYPE_KEY
      );
      assert.isTrue(meta.isMutation());
      assert.equal(
        metadata.getMutationObjectTypeMetadata(AnimalRepository),
        meta
      );
    });

    it('returns undefined when defined as an object type', () => {
      class Animal {}
      metadata.getOrCreateObjectTypeMetadata(Animal);
      assert.isUndefined(metadata.getMutationObjectTypeMetadata(Animal));
    });

    it('returns undefined when defined as a mutation type', () => {
      class Animal {}
      metadata.getOrCreateObjectTypeMetadata(
        Animal,
        metadata.OBJECT_QUERY_TYPE_KEY
      );
      assert.isUndefined(metadata.getMutationObjectTypeMetadata(Animal));
    });
  });

  describe('getOrCreateObjectTypeMetadata()', () => {
    it('returns existing meta', () => {
      class AnimalRepository {}

      const meta = metadata.getOrCreateObjectTypeMetadata(AnimalRepository);
      assert.equal(
        meta,
        metadata.getOrCreateObjectTypeMetadata(AnimalRepository)
      );
    });
  });

  describe('Metadata', () => {
    it('constructor()', () => {
      class AnimalRepository {}

      const meta = metadata.getOrCreateObjectTypeMetadata(AnimalRepository);

      assert.equal(meta.getTarget(), AnimalRepository);
      assert.equal(meta.getKey(), metadata.OBJECT_TYPE_KEY);
      assert.isUndefined(meta.getName());
      assert.equal(meta.getType(), GraphQLObjectType);
      assert.isUndefined(meta.getObjectType());
      assert.equal(Object.keys(meta.getFields()).length, 0);
    });

    it('isQuery()', () => {
      class Animal {}
      class AnimalQuery {}
      class AnimalMutation {}

      assert.isFalse(metadata.getOrCreateObjectTypeMetadata(Animal).isQuery());
      assert.isFalse(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalMutation,
            metadata.OBJECT_MUTATION_TYPE_KEY
          )
          .isQuery()
      );
      assert.isTrue(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalQuery,
            metadata.OBJECT_QUERY_TYPE_KEY
          )
          .isQuery()
      );
    });

    it('isMutation()', () => {
      class Animal {}
      class AnimalQuery {}
      class AnimalMutation {}

      assert.isFalse(
        metadata.getOrCreateObjectTypeMetadata(Animal).isMutation()
      );
      assert.isTrue(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalMutation,
            metadata.OBJECT_MUTATION_TYPE_KEY
          )
          .isMutation()
      );
      assert.isFalse(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalQuery,
            metadata.OBJECT_QUERY_TYPE_KEY
          )
          .isMutation()
      );
    });

    it('isQueryOrMutation()', () => {
      class Animal {}
      class AnimalQuery {}
      class AnimalMutation {}

      assert.isFalse(
        metadata.getOrCreateObjectTypeMetadata(Animal).isQueryOrMutation()
      );
      assert.isTrue(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalMutation,
            metadata.OBJECT_MUTATION_TYPE_KEY
          )
          .isQueryOrMutation()
      );
      assert.isTrue(
        metadata
          .getOrCreateObjectTypeMetadata(
            AnimalQuery,
            metadata.OBJECT_QUERY_TYPE_KEY
          )
          .isQueryOrMutation()
      );
    });

    it('createInstance()', () => {
      let constructorCalledCount = 0;

      class AnimalRepository {
        constructor() {
          constructorCalledCount++;
        }
      }

      const meta = new metadata.Metadata(AnimalRepository);

      assert.equal(constructorCalledCount, 0);

      const animalRepository1 = meta.getTargetInstance();

      assert.instanceOf(animalRepository1, AnimalRepository);
      assert.equal(constructorCalledCount, 1);
      assert.equal(animalRepository1, meta.getTargetInstance());
      assert.equal(constructorCalledCount, 1);
    });

    it('createInstance() creates from container with defined instance', () => {
      let constructorCalledCount = 0;

      class AnimalRepository {
        public hello: string;
        public world: string;

        constructor(hello: string, world: string) {
          constructorCalledCount++;
          this.hello = hello;
          this.world = world;
        }
      }

      const expectedAnimalRepository = new AnimalRepository('hello', 'world');
      setInstance(AnimalRepository, expectedAnimalRepository);

      const meta = new metadata.Metadata(AnimalRepository);

      const animalRepository1 = <AnimalRepository>meta.getTargetInstance();

      assert.instanceOf(animalRepository1, AnimalRepository);
      assert.equal(animalRepository1, expectedAnimalRepository);
      assert.equal(constructorCalledCount, 1);
    });
  });
});
