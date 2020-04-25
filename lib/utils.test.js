'use strict';
/* eslint-env jest */
/* eslint-env node */

const { join } = require('path');

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
  toComponentFileName,
  getAbsoluteImportPath,
  getModuleRelatedImportPath,
} = require('./utils');

test('must dasherize component name', () => {
  assert(dasherizeName('foo'), 'foo');
  assert(dasherizeName('FooBar'), 'Foo-Bar');
  assert(dasherizeName('FooBar/FooBaz'), 'Foo-Bar/Foo-Baz');
  assert(dasherizeName('Foobar'), 'Foobar');
});

test('must convert class case component name to file name', () => {
  assert(toComponentFileName('foo'), 'foo');
  assert(toComponentFileName('FooBar'), 'foo-bar');
  assert(toComponentFileName('FooBar/FooBaz'), 'foo-bar/foo-baz');
  assert(toComponentFileName('Foobar'), 'foobar');
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
