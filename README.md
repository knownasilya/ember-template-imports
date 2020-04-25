# ember-template-component-import

This addon allows you to use import-style syntax to create local bindings to
a component within a template file.

```hbs
---
import { Button } from '@frontile/buttons';
---

<Button @appearance="minimal">I'm a button!</Button>
```

- More concise component invocation while making it explicit where it comes from
- Relative imports (most useful with pods)!
- Autocomplete imported components with [Unstable Ember Language Server](unstable-ls)!

Can be used together with

- [helper imports](https://github.com/patricklx/ember-template-helper-imports)
- [styles import](https://github.com/davewasmer/ember-template-styles-import)

## Compatibility

- Ember.js v3.12 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## Installation

```sh
ember install ember-template-component-import
```

## Usage

Use the same kind of import syntax you are familiar with from Javascript:

```hbs
---
import Button from 'ui/button';
---

<Button @appearance="super-important">I'm a button!</Button>
```

The component is looked up from the given string using the normal lookup
patterns. In fact, all this addon does is rewrite that `import ...` statement
into a wrapping `{{#let (component 'ui/button') as |Button|}}`.

We also do a bit of path magic at build time to let you use relative imports!

> app/pods/some/deeply/nested/route/template.hbs

```hbs
---
import SpecialButton from './super-special-button-used-only-in-this-route';
---

<SpecialButton>I'm so special!</SpecialButton>
```

Some more examples

```hbs
---
import { Button, Card } from 'ui';
import { Input, Select } from 'ui/form/fields';
---

<form {{on 'submit' this.submitForm}}>
  <Input/>
  <Select/>

  <Card>
    <Input/>
  </Card>

  <Button @type="submit">Submit</Button>
</form>
```

In the above examples the components are in `app/pods/ui`, where `app/pods/ui/button` is a component and `app/pods/ui/card`,
as well as components inside the `app/pods/ui/form/fields` folder.

## Editor Integration

Editor integration currently provides auto completion of imported components.

### VSCode

Currently works with **VSCode** combined with the [Unstable Ember Language Server](unstable-ls).

### (Neo)Vim

Possible by using https://github.com/NullVoxPopuli/coc-ember

## Motivation

Angle bracket components are unreasonably delightful to use, but they can be tedious to use when nested, i.e.
`<Dashboard::Setup::Form/>`, which makes you write components that are not nested. Another limitation is that it's
hard to understand where components are coming from.

This addon works around that by leveraging the `component` and `let` helpers
to create a local alias for that component.

A side benefit is the relative paths for imports. Normally, even with pods,
all components must be specified by their full path, i.e.
`<Posts::Post::Comments::Comment::AuthorAvatar/>` rather than `<./AuthorAvatar/>` (which doesn't work).

By rewriting the import syntax at build time, we can replace your relative paths
with the full paths, and everyone is happy!

## What about official support?

There is an RFC for adding framework level primitives https://github.com/emberjs/rfcs/pull/454, but
it hasn't been merged or worked on. Once this lands our goal is to use that API to keep the functionality
that this addon provides. The goal of this addon is to get people to try it and to get hooked so we have an official solution faster!

But be warned - this addon is not official and when an official solution does exist, it might be different.
So weigh the pros and cons carefully before widely adopting this addon.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).

unstable-ls: https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-ember-unstable
