## NO LONGER IN DEVELOPMENT: <a href="https://github.com/19majkel94/type-graphql">type-graphql</a> (boring name) beat me to the punch.

<h1 align="center" style="border-bottom: none;">🎉🎊 graphql-party</h1>
<h3 align="center">A <a href="https://www.typescriptlang.org/docs/handbook/decorators.html">@decorator</a> based <a href="http://graphql.org/graphql-js/">GraphQL.js</a> schema builder.</h3>
<p align="center">
    <a href="https://travis-ci.org/j/graphql-party">
        <img alt="Travis" src="https://img.shields.io/travis/j/graphql-party/preview.svg">
    </a>
    <a href="https://codecov.io/gh/j/graphql-party/branch/preview">
        <img alt="Travis" src="https://img.shields.io/codecov/c/github/j/graphql-party/preview.svg">
    </a>
</p>

**graphql-party** makes it easy to create GraphQL schemas and resolvers from javascript classes using @decorators.

## Install

```sh
yarn add graphql-party
```

## Usage

### Quickstart

```ts
import { GraphQLServer } from 'graphql-yoga';
import { Query, Arg, Field, Types, buildSchema } from 'graphql-party';

class Hello {
  @Query(Types.String)
  hello(
    @Arg('hello', Types.String)
    hello: string
  ) {
    return hello;
  }
}

const server = new GraphQLServer({
  schema: buildSchema(Hello),
});

server.start(() => console.log('Server is running on http://localhost:4000!'));
```

### API

#### Class Decorators

* `@ObjectType({ name?: string; description?: string })`
* `@InputType({ name?: string; description?: string })`

#### Property Decorators

* `@Field(type, { name?: string; description?: string })`

#### Method Decorators

* `@Query(type, { name?: string; description?: string })`
* `@Mutation(type, { name?: string; description?: string })`
* `@FieldResolver(typeFor, outputType, { name?: string; description?: string })`

#### Method Parameter Decorators

* `@Arg(field: string, type: GraphQLPartyType)`
* `@Context(field?: string)`: returns entire context without "field"

#### Utility functions

* `buildSchema(classesOrGlobs, config?: { cwd: string })`: can be a glob of matching files for auto inclusion, or an array of classes that contain `graphql-party` metadata.
* `setInstance(Class, constructedClass)`: By default, any decorated class other than `@ObjectType()` or `@InputType()` get instantiated without any constructor arguments. You can instantiate it before hand and that will be reused from then on.

### `@ObjectType()`

```ts
import { ObjectType, Field, Types } from 'graphql-party';

@ObjectType()
class Author {
  @Field(Types.NonNullable(Types.ID))
  id: string;

  @Field(Types.NonNullable(Types.String))
  name: string;
}

@ObjectType()
class Message {
  @Field(Types.NonNullable(Types.ID))
  id: string;

  @Field(Types.NonNullable(Types.String))
  content: string;

  @Field(Types.NonNullable(Types.String))
  author: string;
}
```

### `@InputType()`

Decorated `@InputType()` classes are to be used where `@Arg()` is used.

```ts
import { InputType, Field, Types } from 'graphql-party';

@InputType()
class MessageInput {
  @Field(Types.NonNullable(Types.String))
  content: string;

  @Field(Types.NonNullable(Types.String))
  author: string;
}
```

### `@Query()` and `@Mutation`

Class methods with `@Query()` and `@Mutation()` get combined into a `Query` or `Mutation` object type. The can live anywhere. Here is an example of one living inside of a service class.

```ts
import { Query, Mutation, Arg, Types, setInstance } from 'graphql-party';
import { Author } from '../models';
import { AuthorRepository } from '../repositories';
import { AuthorInput } from '../inputs';

class AuthorService {
  constructor(private authorRepository: AuthorRepository) {}

  @Query(Types.List(Author))
  async authors(): Promise<Author> {
    return await this.authorRepository.findAll();
  }

  @Mutation(Types.List(Author))
  async createAuthor(
    @Arg('input', AuthorInput) input: AuthorInput
  ): Promise<Author> {
    return await this.authorRepository.create(input);
  }
}

// Since AuthorService requires an author repository, it needs to be instantiated and set.
setInstance(AuthorService, new AuthorService(AuthorRepository.create());
```

### All Field Types

```ts
@ObjectType()
class SomeType {
  @Field(Types.ID) id?: string;

  @Field(Types.Int) someInt?: number;

  @Field(Types.Float) someFloat?: number;

  @Field(Types.String) someString?: string;

  @Field(Types.Boolean) someBoolean?: boolean;

  @Field(SomeType) nestedType?: SomeType;

  @Field(SomeOtherType) someOtherType?: SomeOtherType;

  @Field(Types.NonNullable(Types.String))
  nonNullable: string;

  @Field(Types.NonNullable(Types.String))
  nonNullable: string;

  @Field(Types.List(Types.String))
  list?: string[];

  @Field(Types.NonNullable(Types.List(Types.String)))
  list: string[];

  // You can even provide a custom GraphQLScalarType
  @Field(GraphQLDateTime) dateTime: Date;
}
```

### Adding resolvers to properties

Classes act as a simple class passed directly to GraphQL (see [http://graphql.org/graphql-js/object-types/](http://graphql.org/graphql-js/object-types/). So you can make a `@Field()` a function:

```ts
@ObjectType()
class User {
  @Field(Types.NonNullable(Types.String))
  firstName: string;

  @Field(Types.NonNullable(Types.String))
  lastName: string;

  @Field(Types.List(Types.ID))
  friends?: string[];

  @Field(Types.String)
  fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

But if you have more complex logic, you can put it elsewhere, such as a service:

```ts
class UserService {
  constructor(private userRepository: UserRepository) {}

  @FieldResolver(User, Types.List(User))
  async friends(user: User): Promise<User> {
    return await this.userRepository.findFriendsForUser(user);
  }
}
```

### Param Resolvers (`@Arg()` and `@Context()`)

```ts
class SomeService {
  @Query(Types.Int)
  async rollDice(
    @Arg('times', Types.Int)
    times: number,
    @Context('roller') roller: Function
  ): Promise<User> {
    return roller(times);
  }
}
```

Check out [examples](https://github.com/j/graphql-party/tree/preview/examples) for more examples!
