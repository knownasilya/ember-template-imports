'use strict';
/* eslint-env jest */
/* eslint-env node */

function assert(left, right) {
  expect(left).toEqual(right);
}

const { rewriteTemplate } = require('./rewrite-template');

test('can rewrite template', () => {
  assert(
    rewriteTemplate({
      templateContents: 'contents',
      templatePath: 'app/templates/components/test.hbs',
      imports: [
        {
          importPath: 'foobar/baz',
          localName: 'Foo',
          isLocalNameValid: true,
        },
      ],
    }),
    `{{#let (component 'foobar/baz') as |Foo|}}contents{{/let}}`
  );
});
