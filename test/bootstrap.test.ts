import 'mocha';
import { Container } from 'typedi';
import { resetContainer } from '../src/container';

afterEach(() => {
  Container.reset();
  resetContainer();
});
