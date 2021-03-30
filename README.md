ember-template-imports
==============================================================================

[![Build Status](https://travis-ci.com/knownasilya/ember-template-component-import.svg?branch=master)](https://travis-ci.com/knownasilya/ember-template-component-import)

:warning: You are probably looking for https://github.com/ember-template-imports/ember-template-imports


This addon allows you to use import-style syntax to create local bindings to
a component within a template file.

In other words, it's **pods + angle bracket component = goodness**.

* Use pods and angle bracket components together
* More concise component invocation while making it explicit where it comes from
* No hyphens needed!
* Relative imports!
* Autocomplete imported components with [Unstable Ember Language Server](unstable-ls)!

Can be used together with
* [helper imports](https://github.com/patricklx/ember-template-helper-imports)
* [styles import](https://github.com/davewasmer/ember-template-styles-import)

Installation
------------------------------------------------------------------------------

```
ember install ember-template-component-import
```


Usage
------------------------------------------------------------------------------

Use the same kind of import syntax you are familiar with from Javascript:

```hbs
import Button from 'ui/button';
--- hbs ---

<Button @appearance="super-important">I'm a button!</Button>
```

The component is looked up from the given string using the normal lookup
patterns. In fact, all this addon does is rewrite that `import ...` statement
into a wrapping `{{#let (component 'ui/button') as |Button|}}`.

We also do a bit of path magic at build time to let you use relative imports!

```hbs
{{!-- app/pods/some/deeply/nested/route/template.hbs --}}
import SpecialButton from './super-special-button-used-only-in-this-route';
--- hbs ---

<SpecialButton>I'm so special!</SpecialButton>

```

### JS imports style

```hbs
import BasicDropdown from 'ember-basic-dropdown/components/basic-dropdown';
import { BasicDropdown as SameDropdown } from 'ember-basic-dropdown/components';

--- hbs ---

<BasicDropdown />
<SameDropdown />
```

### Classic imports style

```hbs
{{import BasicDropdown from 'ember-basic-dropdown/components/basic-dropdown'}}
{{import SameDropdown from 'ember-basic-dropdown/components/basic-dropdown'}}

<BasicDropdown />
<SameDropdown />
```

We recommend using the JS style.


Editor Integration
------------------------------------------------------------------------------

Editor integration currently provides auto completion of imported components.

### VSCode

Currently works with **VSCode** combined with the [Unstable Ember Language Server](unstable-ls).

### (Neo)Vim

Possible by using https://github.com/NullVoxPopuli/coc-ember


Motivation
------------------------------------------------------------------------------

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


What about official support?
------------------------------------------------------------------------------

There is an RFC for adding framework level primitives https://github.com/emberjs/rfcs/pull/454, but
it hasn't been merged or worked on. Once this lands our goal is to use that API to keep the functionality
that this addon provides. The goal of this addon is to get people to try it and to get hooked so we have an official solution faster!

But be warned - this addon is not official and when an official solution does exist, it might be different.
So weigh the pros and cons carefully before widely adopting this addon.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

unstable-ls: https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-ember-unstable
