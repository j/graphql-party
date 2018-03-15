import test from 'ava';
// import { ObjectType, Field } from '../../src/decorators/decorators';
// import { Types } from '../../src';
// import { ClassMetadata, factories } from '../../src/mapping';

test('creates plain @ObjectType', t => {
  t.true(true);
});
// test('creates plain @ObjectType', t => {
//   @ObjectType()
//   class Article {
//
//   }
//
//   const metadata = factories.objectType.loadMetadataFor(Article);
//
//   t.true(metadata instanceof ClassMetadata);
//   t.is(metadata.target, Article);
//   t.is(metadata.name, 'Article');
//   t.is(metadata.fieldMetadata.length, 0);
//   t.deepEqual(metadata.fields, {});
// });

// test('creates @ObjectType with lazy-loaded function', t => {
//   @ObjectType()
//   class Base {
//     @Field((rootMetadata: ClassMetadata) => ({ type: Types.Int, name: `${rootMetadata.name}CreatedAt` }))
//     createdAt: number;
//   }
//
//   @ObjectType()
//   class Article extends Base {
//     @Field(Types.String)
//     title: string;
//   }
//
//   const metadata = factories.objectType.loadMetadataFor(Article);
//
//   console.log(metadata);
//
//   t.true(metadata instanceof ClassMetadata);
//   t.is(metadata.target, Article);
//   t.is(metadata.name, 'Article');
//   t.is(metadata.fieldMetadata.length, 0);
//   t.deepEqual(metadata.fields, {});
// });
