import 'mocha';
import { Container } from 'typedi';
import { resetContainer } from '../src/container';
import { factories } from '../src/mapping';

afterEach(() => {
  Container.reset();
  resetContainer();
  Object.values(factories).forEach(factory => factory.clear());
});
