ember-template-component-import
==============================================================================

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
{{import Button from 'ui/button'}}

<Button @appearance="super-important">I'm a button!</Button>
```

Note that the above format is the only kind of import syntax supported (unlike
actual ES2015 which supports lots of variations of that).

The component is looked up from the given string using the normal lookup
patterns. In fact, all this addon does is rewrite that `{{import ...}}` statement
into a wrapping `{{#let (component 'ui/button') as |Button|}}`.

We also do a bit of path magic at build time to let you use relative imports!

```hbs
{{!-- app/pods/some/deeply/nested/route/template.hbs --}}
{{import SpecialButton from './super-special-button-used-only-in-this-route'}}

<SpecialButton>I'm so special!</SpecialButton>

```

### Octane imports style

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

Editor Integration
------------------------------------------------------------------------------

Editor integration currently provides auto completion of imported components.

### VSCode

Currently works with **VSCode** combined with the [Unstable Ember Language Server](unstable-ls).

### (Neo)Vim

Possible by using https://github.com/NullVoxPopuli/coc-ember


Motivation
------------------------------------------------------------------------------

Angle bracket components are unreasonably delightful to use, but they don't
play well with a pods application structure, since pods = slashes in the
component name, and angle brackets can't do slashes.

This addon works around that by leveraging the `component` and `let` helpers
to create a local alias for that component.

A side benefit is the relative paths for imports. Normally, even with pods,
all components must be specified by their full path, i.e.
`{{posts/post/comments/comment/authorAvatar}}` rather than `{{./authorAvatar}}`.

By rewriting the import syntax at build time, we can replace your relative paths
with the full paths, and everyone is happy!


But what about Module Unification?
------------------------------------------------------------------------------

Once Module Unification lands fully, this addon will be largely obsolete. MU
provides all these benefits and more.

So on the one hand, your templates will start to look _something kinda like_
MU a little sooner, which is nice.

But be warned - any official tooling to codemod templates into a new MU world
likely won't support this addon. So weigh the pros and cons carefully before
widely adopting this addon.

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

unstable-ls: https://marketplace.visualstudio.com/items?itemName=lifeart.vscode-ember-unstable