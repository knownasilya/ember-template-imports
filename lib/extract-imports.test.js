'use strict';
/* eslint-env jest */
/* eslint-env node */

function assert(left, right) {
  expect(left).toEqual(right);
}

const {
  processImports,
  hasImports,
  extractImports,
  isValidVariableName,
} = require('./extract-imports');

test('it must check isValidVariableName', () => {
  assert(isValidVariableName('foo'), false);
  assert(isValidVariableName('Foo-Bar'), false);
  assert(isValidVariableName('Foo'), true);
  assert(isValidVariableName('FooBar'), true);
});

it('hasImports must detect if imports exist', () => {
  assert(hasImports('---\ntest\n---\n'), true);
  assert(hasImports('--- \ntest\n---\n'), true);
  assert(hasImports('--- \ntest\n---\n\nasd'), true);
  assert(hasImports('---\ntest\n---asd'), false);
  assert(hasImports('-- \ntest\n---'), false);
  assert(hasImports('--- \ntest\n'), false);
});

it('extractImports should return imports and content', () => {
  const input = `---
import FooBar from 'some-path';
import { Boo } from 'second-path';
---
content`;
  const { importStatements, contentWithoutImports } = extractImports(input);

  assert(
    importStatements,
    [
      `import FooBar from 'some-path';`,
      `import { Boo } from 'second-path';`,
    ].join('\n')
  );
  assert(contentWithoutImports, 'content');
});

test('processImports must make an object out of import statements', () => {
  assert(processImports(''), []);

  assert(processImports(`import Foo from 'foo-bar/baz';`), [
    {
      importLocation: 'foo-bar/baz',
      defaultImport: {
        isLocalNameValid: true,
        localName: 'Foo',
        originalName: 'Foo',
        componentFileName: 'baz',
      },
    },
  ]);

  assert(processImports(`import Foo from 'foo-bar/baz';`), [
    {
      importLocation: 'foo-bar/baz',
      defaultImport: {
        isLocalNameValid: true,
        localName: 'Foo',
        originalName: 'Foo',
        componentFileName: 'baz',
      },
    },
  ]);

  assert(processImports(`import Foo from './foo-bar/baz';`), [
    {
      importLocation: './foo-bar/baz',
      defaultImport: {
        isLocalNameValid: true,
        localName: 'Foo',
        originalName: 'Foo',
        componentFileName: 'baz',
      },
    },
  ]);

  assert(processImports(`import { Foo, Bar as Baz } from 'test-app';`), [
    {
      importLocation: 'test-app',
      namedImports: [
        {
          isLocalNameValid: true,
          localName: 'Foo',
          originalName: 'Foo',
          componentFileName: 'foo',
        },
        {
          isLocalNameValid: true,
          localName: 'Baz',
          originalName: 'Bar',
          componentFileName: 'bar',
        },
      ],
    },
  ]);

  assert(
    processImports(
      [
        `import { Foo, Bar as Baz } from 'test-app';`,
        `import Button from './button';`,
      ].join('\n')
    ),
    [
      {
        importLocation: 'test-app',
        namedImports: [
          {
            isLocalNameValid: true,
            localName: 'Foo',
            originalName: 'Foo',
            componentFileName: 'foo',
          },
          {
            isLocalNameValid: true,
            localName: 'Baz',
            originalName: 'Bar',
            componentFileName: 'bar',
          },
        ],
      },
      {
        importLocation: './button',
        defaultImport: {
          isLocalNameValid: true,
          localName: 'Button',
          originalName: 'Button',
          componentFileName: 'button',
        },
      },
    ]
  );
});
