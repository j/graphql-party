import 'mocha';
import { assert } from 'chai';
import { Container, Inject, Service } from 'typedi';
import { getQueryObjectTypeMetadata } from '../../src/metadata';
import { execQuery } from '../helpers';
import * as fixtures from '../fixtures/user';
import { printSchema, graphql } from 'graphql';
import {
  Query,
  ObjectType,
  Types,
  Field,
  Arg,
  Context,
  buildSchema,
  typeFromClassWithQueries,
} from '../../src';
import { setInstance, useContainer } from '../../src/container';

describe('@Query()', () => {
  it('calls handler', async () => {
    class Cow {
      public calledCount: any = 0;

      constructor() {
        this.calledCount = 0;
      }

      @Query(Types.String)
      soundsLike() {
        this.calledCount++;

        return 'moo!';
      }
    }

    const queryType = typeFromClassWithQueries([Cow]);
    const cow = <Cow>getQueryObjectTypeMetadata(Cow).getTargetInstance();

    const result = await execQuery(
      queryType,
      `
      query {
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
    class Cow {
      public calledCount: any = 0;

      constructor() {
        this.calledCount = 0;
      }

      @Query(Types.String)
      async soundsLike(): Promise<string> {
        return new Promise<string>(resolve => {
          this.calledCount++;

          resolve('moo!');
        });
      }
    }

    const queryType = typeFromClassWithQueries([Cow]);
    const cow = <Cow>getQueryObjectTypeMetadata(Cow).getTargetInstance();

    const result = await execQuery(
      queryType,
      `
      query {
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

  it('calls handler with name', async () => {
    let calledCount = 0;
    class CowRepository {
      constructor(public color: string) {}

      @Query(Types.String, { name: 'color' })
      getColor() {
        calledCount++;

        return this.color;
      }
    }

    setInstance(CowRepository, new CowRepository('brown'));

    const queryType = typeFromClassWithQueries([CowRepository]);

    const result = await execQuery(
      queryType,
      `
      query {
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

      @Query(Types.String, { name: 'color' })
      async getColor(): Promise<string> {
        return new Promise<string>(resolve => {
          calledCount++;

          resolve(this.color);
        });
      }
    }

    setInstance(CowRepository, new CowRepository('brown'));

    const queryType = typeFromClassWithQueries([CowRepository]);

    const result = await execQuery(
      queryType,
      `
      query {
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
