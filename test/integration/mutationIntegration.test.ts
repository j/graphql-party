import 'mocha';
import { assert } from 'chai';
import { Mutation, Types, typeFromClassWithMutations } from '../../src';
import { getMutationObjectTypeMetadata } from '../../src/metadata';
import { execMutation } from '../helpers';

describe('@Mutation()', () => {
  it('calls handler', async () => {
    class AnimalRepository {
      public calledCount: any = 0;

      constructor() {
        this.calledCount = 0;
      }

      @Mutation(Types.String)
      soundsLike() {
        this.calledCount++;

        return 'moo!';
      }
    }

    const mutationType = typeFromClassWithMutations([AnimalRepository]);
    const cow = <AnimalRepository>getMutationObjectTypeMetadata(
      AnimalRepository
    ).getTargetInstance();

    const result = await execMutation(
      mutationType,
      `
      mutation {
        soundsLike
      }
    `
    );

    assert.deepEqual(result, {
      data: {
        soundsLike: 'moo!',
      },
    });

    assert.equal(cow.calledCount, 1);
  });

  it('calls async handler', async () => {
    class AnimalRepository {
      public calledCount: any = 0;

      constructor() {
        this.calledCount = 0;
      }

      @Mutation(Types.String)
      async soundsLikeAsync() {
        this.calledCount++;

        return '...moo!';
      }
    }

    const mutationType = typeFromClassWithMutations([AnimalRepository]);
    const cow = <AnimalRepository>getMutationObjectTypeMetadata(
      AnimalRepository
    ).getTargetInstance();

    const result = await execMutation(
      mutationType,
      `
      mutation {
        soundsLikeAsync
      }
    `
    );

    assert.deepEqual(result, {
      data: {
        soundsLikeAsync: '...moo!',
      },
    });

    assert.equal(cow.calledCount, 1);
  });

  it('calls handler with name', async () => {
    let calledCount = 0;
    class CowRepository {
      constructor(public color: string) {}

      @Mutation(Types.String, { name: 'color' })
      getColor() {
        calledCount++;

        return this.color;
      }
    }

    const mutationType = typeFromClassWithMutations([
      [CowRepository, ['brown']],
    ]);

    const result = await execMutation(
      mutationType,
      `
      mutation {
        color
      }
    `
    );

    assert.deepEqual(result, {
      data: {
        color: 'brown',
      },
    });

    assert.equal(calledCount, 1);
  });

  it('calls async handler with name', async () => {
    let calledCount = 0;
    class CowRepository {
      constructor(public color: string) {}

      @Mutation(Types.String, { name: 'color' })
      async setColor() {
        calledCount++;

        return this.color;
      }
    }

    const mutationType = typeFromClassWithMutations([
      [CowRepository, ['brown']],
    ]);

    const result = await execMutation(
      mutationType,
      `
      mutation {
        color
      }
    `
    );

    assert.deepEqual(result, {
      data: {
        color: 'brown',
      },
    });

    assert.equal(calledCount, 1);
  });
});
