'use strict';
/* eslint-env jest */
/* eslint-env node */

const { join, sep } = require('path');

function assert(left, right) {
  expect(left).toEqual(right);
}

function normalizePath(importPath) {
  if (importPath.includes(':')) {
    const parts = importPath.split('/');
    parts.shift();
    return '/' + parts.join('/');
  } else {
    return importPath;
  }
}

const {
  dasherizeName,
  processImports,
  hasImports,
  extractImports,
  isValidVariableName,
  getAbsoluteImportPath,
  getModuleRelatedImportPath,
} = require('./extract');

it('must dasherize component name', () => {
  assert(dasherizeName('foo'), 'foo');
  assert(dasherizeName('FooBar'), 'Foo-Bar');
  assert(dasherizeName('FooBar/FooBaz'), 'Foo-Bar/Foo-Baz');
  assert(dasherizeName('Foobar'), 'Foobar');
});

test('it must check isValidVariableName', () => {
  assert(isValidVariableName('foo'), false);
  assert(isValidVariableName('Foo-Bar'), false);
  assert(isValidVariableName('Foo'), true);
  assert(isValidVariableName('FooBar'), true);
});

test('getAbsoluteImportPath must return valid paths', () => {
  assert(
    normalizePath(getAbsoluteImportPath('/some/root', './foo')),
    '/some/foo'
  );
  assert(
    normalizePath(getAbsoluteImportPath('/some/root/boot', './../foo')),
    '/some/foo'
  );
  assert(
    normalizePath(getAbsoluteImportPath('/some/root/boot', './../../foo')),
    '/foo'
  );
});

test('getModuleRelatedImportPath must return related import', () => {
  assert(
    normalizePath(getModuleRelatedImportPath('/some/root', '/some/root')),
    ''
  );
  const rootPath = join(__dirname, '..');
  const filePath = join(rootPath, 'lib');
  assert(getModuleRelatedImportPath(rootPath, filePath), 'lib');
  assert(
    getModuleRelatedImportPath(rootPath, join(filePath, 'utils.test.js')),
    'lib/utils.test.js'
  );
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
  const root = ['src', 'ui'].join(sep);
  const fileName = ['parent-component', 'child-component', 'template.hbs'].join(
    sep
  );
  assert(processImports('', 'foo', root), []);
  assert(processImports(`import Foo from 'foo-bar/baz';`, 'foo.hbs', root), [
    {
      importPath: 'foo-bar/baz',
      isLocalNameValid: true,
      localName: 'Foo',
      originalName: 'Foo',
    },
  ]);
  assert(processImports(`import Foo from 'foo-bar/baz';`, fileName, root), [
    {
      importPath: 'foo-bar/baz',
      isLocalNameValid: true,
      localName: 'Foo',
      originalName: 'Foo',
    },
  ]);
  assert(processImports(`import Foo from './foo-bar/baz';`, fileName, root), [
    {
      importPath: '../../parent-component/child-component/foo-bar/baz',
      isLocalNameValid: true,
      localName: 'Foo',
      originalName: 'Foo',
    },
  ]);
});
