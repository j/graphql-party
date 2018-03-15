import 'mocha';
import { assert } from 'chai';
import { Types } from '../../src';
import { FieldBuilder } from '../../src/builder/FieldBuilder';
import { ObjectTypeBuilder } from '../../src/builder/TypeBuilder';

describe('FieldBuilder', () => {
  it('decorates', () => {
    class User {
      public name: string;
    }

    const builder = new ObjectTypeBuilder();

    builder.Class = User;
    builder.name = 'User';
    builder.members = {
      name: { type: Types.String },
    };

    console.log(builder);
  });
});
