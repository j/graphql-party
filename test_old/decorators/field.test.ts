import 'mocha';
import { assert } from 'chai';
import { Types } from '../../src';
import { ObjectType, Field } from '../../src/decorators/decorators';
import { ClassMetadata } from '../../src/mapping/ClassMetadata';
import { factories } from '../../src/mapping';

describe('@Field()', () => {
  it('decorates', async () => {
    @ObjectType()
    class Article {
      @Field(Types.String) title: string;
    }

    const metadata = factories.objectType.loadMetadataFor(Article);

    assert.instanceOf(metadata, ClassMetadata);
    assert.equal(metadata.target, Article);
    assert.equal(metadata.name, 'Article');
    assert.deepEqual(metadata.fieldMetadata, [
      {
        type: Types.String,
        isStatic: false,
        key: 'title',
        name: 'title',
        description: undefined,
      },
    ]);
    assert.deepEqual(metadata.fields, {
      title: {
        type: Types.String,
        description: undefined,
      },
    });
  });

  it('decorates with name', async () => {
    @ObjectType()
    class Article {
      @Field(Types.String, { name: 'the_title' })
      title: string;
    }

    const metadata = factories.objectType.loadMetadataFor(Article);
    console.log(metadata);

    assert.instanceOf(metadata, ClassMetadata);
    assert.equal(metadata.target, Article);
    assert.equal(metadata.name, 'Article');
    assert.deepEqual(metadata.fieldMetadata, [
      {
        type: Types.String,
        isStatic: false,
        key: 'title',
        name: 'the_title',
        description: undefined,
      },
    ]);
    assert.deepEqual(metadata.fields, {
      the_title: {
        type: Types.String,
        description: undefined,
      },
    });
  });
  //
  // it('decorates with description', async () => {
  //   @ObjectType()
  //   class Article {
  //     @Field(Types.String, { description: 'The article title' })
  //     title: string;
  //   }
  //
  //   const metadataFactory = ClassMetadataFactory.getInstance();
  //   await metadataFactory.process();
  //   const metadata = metadataFactory.loadMetadata(Article);
  //
  //   assert.instanceOf(metadata, ClassMetadata);
  //   assert.equal(metadata.target, Article);
  //   assert.equal(metadata.name, 'Article');
  //   assert.deepEqual(metadata.fieldMetadata, [
  //     {
  //       type: Types.String,
  //       isStatic: false,
  //       key: 'title',
  //       name: 'title',
  //       description: 'The article title',
  //     },
  //   ]);
  //   assert.deepEqual(metadata.fields, {
  //     title: {
  //       type: Types.String,
  //       description: 'The article title',
  //     },
  //   });
  // });
});
