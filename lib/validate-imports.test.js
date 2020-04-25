'use strict';
/* eslint-env jest */
/* eslint-env node */

function assert(left, right) {
  expect(left).toEqual(right);
}

const {
  usingDefaultImports,
  findLocalComponents,
} = require('./validate-imports');

test('using default import style', () => {
  assert(
    usingDefaultImports(`import { Test } from 'strider'`, 'strider'),
    true
  );
  assert(
    usingDefaultImports(
      `import { Test } from '@strider/test'`,
      '@strider/test'
    ),
    true
  );
  assert(
    usingDefaultImports(`import { Test } from './strider'`, './strider'),
    false
  );
  assert(
    usingDefaultImports(`import { Test } from 'strider/test'`, 'strider/test'),
    false
  );
});

test('can find local components if pods', () => {
  assert(
    findLocalComponents(
      process.cwd() + '/tests/dummy/app/pods/components',
      'pods'
    ),
    [{ name: 'test-me', componentName: 'TestMe' }]
  );
});

test('can find local components if classic', () => {
  assert(findLocalComponents(process.cwd() + '/tests/dummy/app', 'classic'), [
    { name: 'test-me-classic-two', componentName: 'TestMeClassicTwo' },
    { name: 'test-me-classic', componentName: 'TestMeClassic' },
  ]);
});
