'use strict';

/* eslint-env node */

const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');
const md5Hex = require('md5-hex');
const { createImportWarning } = require('./lib/utils');
const { extractImports, processImports } = require('./lib/extract');

class TemplateImportProcessor extends BroccoliFilter {
  constructor(inputNode, options = {}) {
    if (!Object.prototype.hasOwnProperty.call(options, 'persist')) {
      options.persist = true;
    }

    super(inputNode, {
      annotation: options.annotation,
      persist: options.persist,
    });

    this.options = options;
    this._console = this.options.console || console;

    this.extensions = ['hbs', 'handlebars'];
    this.targetExtension = 'hbs';
  }

  baseDir() {
    return __dirname;
  }

  cacheKeyProcessString(string, relativePath) {
    return md5Hex([string, relativePath]);
  }

  processString(contents, relativePath) {
    let { importStatements, contentWithoutImports } = extractImports(
      contents,
      relativePath
    );

    if (!importStatements) {
      return contents;
    }

    const imports = processImports(
      importStatements,
      relativePath,
      this.options.root
    );

    let header = imports
      .map(({ importPath, localName, isLocalNameValid }) => {
        const warn = createImportWarning(
          relativePath,
          localName,
          isLocalNameValid,
          this._console
        );
        let componentName = `(component '${importPath}')`;

        return `${warn}{{#let ${componentName} as |${localName}|}}`;
      })
      .join('');
    let footer = imports.map(() => `{{/let}}`).join('');
    let result = header + contentWithoutImports + footer;
    return result;
  }
}

module.exports = {
  name: require('./package').name,

  setupPreprocessorRegistry(type, registry) {
    // this is called before init, so, we need to check podModulePrefix later (in toTree)
    let componentsRoot = null;
    const projectConfig = this.project.config();
    const podModulePrefix = projectConfig.podModulePrefix;

    // by default `ember g component foo-bar --pod`
    // will create app/components/foo-bar/{component.js,template.hbs}
    // so, we can handle this case and just fallback to 'app/components'

    if (podModulePrefix === undefined) {
      componentsRoot = path.join(this.project.root, 'app', 'components');
    } else {
      componentsRoot = path.join(this.project.root, podModulePrefix);
    }

    registry.add('template', {
      name: 'ember-template-component-import',
      ext: 'hbs',
      toTree: (tree) => {
        tree = new TemplateImportProcessor(tree, { root: componentsRoot });
        return tree;
      },
    });

    if (type === 'parent') {
      this.parentRegistry = registry;
    }
  },
};
