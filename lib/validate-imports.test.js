'use strict';
/* eslint-env jest */
/* eslint-env node */

function assert(left, right) {
  expect(left).toEqual(right);
}

const {
  usingDefaultImports,
  findAppLevelComponents,
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
    findAppLevelComponents(
      [
        {
          name: 'test-me',
          type: 'directory',
          children: [
            {
              name: 'template.hbs',
              extension: '.hbs',
              type: 'file',
            },
          ],
        },
      ],
      'pods'
    ),
    [{ name: 'test-me', componentName: 'TestMe' }]
  );
});

test('can find local components if classic', () => {
  assert(
    findAppLevelComponents(
      [
        {
          name: 'templates',
          type: 'directory',
          children: [
            {
              name: 'components',
              type: 'directory',
              children: [
                {
                  name: 'test-me-classic-two.hbs',
                  extension: '.hbs',
                  type: 'file',
                },
              ],
            },
          ],
        },
        {
          name: 'components',
          type: 'directory',
          children: [
            {
              name: 'test-me-classic.js',
              extension: '.js',
              type: 'file',
            },
          ],
        },
      ],
      'classic'
    ),
    [
      { name: 'test-me-classic-two', componentName: 'TestMeClassicTwo' },
      { name: 'test-me-classic', componentName: 'TestMeClassic' },
    ]
  );
});
