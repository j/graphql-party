import 'mocha';
import { assert } from 'chai';
import { Container, Inject, Service } from 'typedi';
import { execQuery } from './helpers';
import { graphql } from 'graphql';
import {
  Query,
  ObjectType,
  Types,
  Field,
  Arg,
  Context,
  buildSchema,
  typeFromClassWithQueries,
} from '../src';
import { useContainer, setInstance, setContainer } from '../src/container';

describe('container', () => {
  it('plays well with "typedi"', async () => {
    @ObjectType()
    class Animal {
      @Field(Types.String) name: string;

      constructor(name) {
        this.name = name;
      }
    }

    const animals = {
      Cow: new Animal('Cow'),
    };

    @Service()
    class AnimalRepository {
      async findAnimal(name): Promise<Animal> {
        return animals[name];
      }
    }

    @Service()
    class AnimalService {
      @Inject() animalRepository: AnimalRepository;

      @Query(Animal)
      async Animal(
        @Arg('name', Types.String)
        name: string
      ): Promise<Animal> {
        return await this.animalRepository.findAnimal(name);
      }
    }

    useContainer(AnimalService, Container);

    const schema = buildSchema(Animal, AnimalService);

    const result = await graphql(
      schema,
      `
        query {
          Animal(name: "Cow") {
            name
          }
        }
      `
    );

    assert.deepEqual(result, {
      data: {
        Animal: {
          name: 'Cow',
        },
      },
    });
  });

  it('plays well with "typedi" using setContainer', async () => {
    @ObjectType()
    class Animal {
      @Field(Types.String) name: string;

      constructor(name) {
        this.name = name;
      }
    }

    const animals = {
      Cow: new Animal('Cow'),
    };

    @Service()
    class AnimalRepository {
      async findAnimal(name): Promise<Animal> {
        return animals[name];
      }
    }

    @Service()
    class AnimalService {
      @Inject() animalRepository: AnimalRepository;

      @Query(Animal)
      async Animal(
        @Arg('name', Types.String)
        name: string
      ): Promise<Animal> {
        return await this.animalRepository.findAnimal(name);
      }
    }

    setContainer(Container);

    const schema = buildSchema(Animal, AnimalService);

    const result = await graphql(
      schema,
      `
        query {
          Animal(name: "Cow") {
            name
          }
        }
      `
    );

    assert.deepEqual(result, {
      data: {
        Animal: {
          name: 'Cow',
        },
      },
    });
  });

  it('returns set instance', async () => {
    @ObjectType()
    class Animal {
      @Field(Types.String) name: string;

      constructor(name) {
        this.name = name;
      }
    }

    class AnimalRepository {
      private animals = {
        Cow: new Animal('Cow'),
      };

      async findAnimal(name): Promise<Animal> {
        return this.animals[name];
      }
    }

    class AnimalService {
      constructor(private animalRepository: AnimalRepository) {}

      @Query(Animal)
      async Animal(
        @Arg('name', Types.String)
        name: string
      ): Promise<Animal> {
        return await this.animalRepository.findAnimal(name);
      }
    }

    setInstance(AnimalService, new AnimalService(new AnimalRepository()));

    const schema = buildSchema(Animal, AnimalService);

    const result = await graphql(
      schema,
      `
        query {
          Animal(name: "Cow") {
            name
          }
        }
      `
    );

    assert.deepEqual(result, {
      data: {
        Animal: {
          name: 'Cow',
        },
      },
    });
  });
});
