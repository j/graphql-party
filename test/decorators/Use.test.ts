import test from 'ava';
import { ObjectType, Use, Query, Field } from '../../src/decorators/decorators';
import { Types } from '../../src';
import { ClassMetadata, factories, fieldProcessors } from '../../src/mapping';
import { GraphQLObjectType, printSchema } from 'graphql';
import { buildSchema } from '../../src/utilities/buildSchema';

test('creates @Query with lazy-loaded function', t => {
  function Gettable(repository) {
    console.log(repository.getType());

    class GettablePlugin {
      @Query(repository.getType(), { name: `get${repository.getName()}` })
      getOne(): string {
        return repository.findOne();
      }
    }

    return GettablePlugin;
  }

  @ObjectType()
  class Article {
    @Field(Types.String) public name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @Use(Gettable)
  class ArticleRepository {
    public db = [new Article('Article 1'), new Article('Article 2')];

    findOne(): Article {
      return this.db[0];
    }

    getType(): { new (...props): Article } {
      return Article;
    }

    getName() {
      return 'Article';
    }
  }

  @ObjectType()
  class Another {
    @Field(Types.String) public name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @Use(Gettable)
  class AnotherRepository {
    public db = [new Another('Article 1'), new Another('Article 2')];

    findOne(): Another {
      return this.db[0];
    }

    getName() {
      return 'Another';
    }

    getType(): { new (...props): Another } {
      return Another;
    }
  }

  const schema = buildSchema([
    Article,
    Another,
    ArticleRepository,
    AnotherRepository,
  ]);

  console.log('schema', printSchema(schema));
  t.true(true);
});
