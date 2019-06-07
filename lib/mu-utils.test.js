"use strict";
/* eslint-env jest */
/* eslint-env node */
function assert(left, right) {
  expect(left).toEqual(right);
}

const {
  getLetedComponentName,
  dasherizeName,
  toLegacyImport,
  hasOctaneImports,
  transformOctaneImports
} = require("./mu-utils");

it("must dasherize component name", () => {
  assert(dasherizeName("foo"), "foo");
  assert(dasherizeName("FooBar"), "Foo-Bar");
  assert(dasherizeName("FooBar/FooBaz"), "Foo-Bar/Foo-Baz");
  assert(dasherizeName("Foobar"), "Foobar");
});

it("must detect OctaneImports", () => {
  assert(hasOctaneImports("--- hbs ---"), true);
  assert(hasOctaneImports("---"), false);
  assert(hasOctaneImports("-- hbs --"), false);
});

it("toLegacyImport must transform js-like imports to hbs-like", () => {
  assert(
    toLegacyImport(`import foo from 'bar'`, "boo"),
    '{{import foo from "bar"}}'
  );
  assert(
    toLegacyImport(`import { foo } from 'bar'`, "boo"),
    '{{import foo from "bar/foo"}}'
  );
  assert(
    toLegacyImport(`import { foo as doo } from 'bar'`, "boo"),
    '{{import doo from "bar/foo"}}'
  );
  assert(
    toLegacyImport(`import { foo as doo, buzz } from 'bar'`, "boo"),
    ['{{import doo from "bar/foo"}}', '{{import buzz from "bar/buzz"}}'].join(
      "\n"
    )
  );
});

it("transformOctaneImports must transform template text from octane to classic imports", () => {
  const input = `
        import FooBar from 'some-path';
        import { Boo } from 'second-path';
        --- hbs ---
    `;
  assert(
    transformOctaneImports(input, "path").trim(),
    [
      `{{import FooBar from "some-path"}}`,
      `{{import Boo from "second-path/boo"}}`
    ].join("\n")
  );
});

it("must return correct component name for MU cases", () => {
  assert(getLetedComponentName("foo-bar", "baz"), '(component "foo-bar")');
  assert(
    getLetedComponentName("/src/ui/components/foo-bar/some-name", "baz"),
    '(component "foo-bar/some-name")'
  );
  assert(
    getLetedComponentName(
      "absolute/src/ui/components/foo-bar/some-name",
      "baz"
    ),
    '(component "foo-bar/some-name")'
  );
  assert(
    getLetedComponentName(
      "/src/ui/routes/app/-components/foo-bar/some-name",
      "baz"
    ),
    '(component (register-absolute-template-import "baz" "/src/ui/routes/app/-components/foo-bar/some-name"))'
  );
  assert(
    getLetedComponentName(
      "absolute/src/ui/routes/index/-components/foo-bar/some-name",
      "baz"
    ),
    '(component (register-absolute-template-import "baz" "absolute/src/ui/routes/index/-components/foo-bar/some-name"))'
  );
});
