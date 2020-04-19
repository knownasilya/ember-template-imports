'use strict';
/* eslint-env jest */
/* eslint-env node */
function assert(left, right) {
  expect(left).toEqual(right);
}

const {
  dasherizeName,
  toLegacyImport,
  hasOctaneImports,
  transformOctaneImports,
} = require('./octane-utils');

it('must dasherize component name', () => {
  assert(dasherizeName('foo'), 'foo');
  assert(dasherizeName('FooBar'), 'Foo-Bar');
  assert(dasherizeName('FooBar/FooBaz'), 'Foo-Bar/Foo-Baz');
  assert(dasherizeName('Foobar'), 'Foobar');
});

it('must detect OctaneImports', () => {
  assert(hasOctaneImports('---\ntest\n---\n'), true);
  assert(hasOctaneImports('--- \ntest\n---\n'), true);
  assert(hasOctaneImports('--- \ntest\n---\n\nasd'), true);
  assert(hasOctaneImports('---\ntest\n---asd'), false);
  assert(hasOctaneImports('-- \ntest\n---'), false);
  assert(hasOctaneImports('--- \ntest\n'), false);
});

it('toLegacyImport must transform js-like imports to hbs-like', () => {
  assert(
    toLegacyImport(`import foo from 'bar'`, 'boo'),
    '{{import foo from "bar"}}'
  );
  assert(
    toLegacyImport(`import { foo } from 'bar'`, 'boo'),
    '{{import foo from "bar/foo"}}'
  );
  assert(
    toLegacyImport(`import { foo as doo } from 'bar'`, 'boo'),
    '{{import doo from "bar/foo"}}'
  );
  assert(
    toLegacyImport(`import { foo as doo, buzz } from 'bar'`, 'boo'),
    ['{{import doo from "bar/foo"}}', '{{import buzz from "bar/buzz"}}'].join(
      '\n'
    )
  );
});

it('transformOctaneImports must transform template text from octane to classic imports', () => {
  const input = `---
import FooBar from 'some-path';
import { Boo } from 'second-path';
---
    `;
  assert(
    transformOctaneImports(input, 'path').trim(),
    [
      `{{import FooBar from "some-path"}}`,
      `{{import Boo from "second-path/boo"}}`,
    ].join('\n')
  );
});
