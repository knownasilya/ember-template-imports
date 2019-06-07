"use strict";

/* eslint-env node */

const path = require("path");
const BroccoliFilter = require("broccoli-persistent-filter");
const md5Hex = require("md5-hex");
const { transformImports, createImportWarning } = require("./lib/utils");
const {
  transformOctaneImports,
  hasOctaneImports,
  getLetedComponentName
} = require("./lib/mu-utils");

let isModuleUnification;
const assert = require('assert');
const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');
const md5Hex = require('md5-hex');

const IMPORT_PATTERN = /\{\{\s*import\s+([^\s]+)\s+from\s+['"]([^'"]+)['"]\s*\}\}/gi;

function isValidVariableName(name) {
  if (!(/^[A-Za-z0-9]+$/.test(name))) {
    return false;
  }
  if (name.charAt(0).toUpperCase() !== name.charAt(0)) {
    return false;
  }
  return true;
}
class TemplateImportProcessor extends BroccoliFilter {
  constructor(inputNode, options = {}) {
    if (!options.hasOwnProperty("persist")) {
      options.persist = true;
    }

    super(inputNode, {
      annotation: options.annotation,
      persist: options.persist
    });

    this.options = options;
    this._console = this.options.console || console;

    this.extensions = ["hbs", "handlebars"];
    this.targetExtension = "hbs";
  }

  baseDir() {
    return __dirname;
  }

  cacheKeyProcessString(string, relativePath) {
    return md5Hex([string, relativePath]);
  }

  processString(contents, relativePath) {
    if (hasOctaneImports(contents)) {
      contents = transformOctaneImports(contents, relativePath);
    }

    const { imports, rewrittenContents } = transformImports(
      contents,
      relativePath,
      this.options.root
    );

    let header = imports
      .map(({ importPath, localName, isLocalNameValid }) => {
        const warn = createImportWarning(
          relativePath,
          localName,
          isLocalNameValid
        );
        let componentName = "";
        if (isModuleUnification) {
          componentName = getLetedComponentName(importPath, relativePath);
        } else {
          componentName = `(component '${importPath}')`;
        }
        return `${warn}{{#let ${componentName} as |${localName}|}}`;
      })
      .join("");
    let footer = imports.map(() => `{{/let}}`).join("");
    let rewrittenContents = contents.replace(IMPORT_PATTERN, (_, localName, importPath) => {
      if (importPath.startsWith('.')) {
        importPath = path.resolve(relativePath, '..', importPath).split(path.sep).join('/');
        importPath = path.relative(this.options.root, importPath).split(path.sep).join('/');
      }
      imports.push({ localName, importPath, isLocalNameValid: isValidVariableName(localName) });
      return '';
    });

    let header = imports.map(({ importPath, localName, isLocalNameValid }) => {
      const warnPrefix = 'ember-template-component-import: ';
      const abstractWarn = `${warnPrefix} Allowed import variable names - CamelCased strings, like: FooBar, TomDale`;
      const componentWarn =  `
        ${warnPrefix}Warning!
        in file: "${relativePath}"
        subject: "${localName}" is not allowed as Variable name for Template import.`;
      const warn = isLocalNameValid ? '' : `
        <pre data-test-name="${localName}">${componentWarn}</pre>
        <pre data-test-global-warn="${localName}">${abstractWarn}</pre>
      `;
      if (!isLocalNameValid) {
        this._console.log(componentWarn);
        if (relativePath !== 'dummy/pods/application/template.hbs') {
          // don't throw on 'dummy/pods/application/template.hbs' (test template)
          throw new Error(componentWarn);
        }
      }
      return `${warn}{{#let (component '${ importPath }') as |${ localName }|}}`;
    }).join('');
    let footer = imports.map(() => `{{/let}}`).join('');
    let result = header + rewrittenContents + footer;
    return result;
  }
}

module.exports = {
  name: require("./package").name,
  init() {
    this._super.init.apply(this, arguments);
    if (process.env.EMBER_CLI_MODULE_UNIFICATION) {
      this.project.isModuleUnification = function() {
        return true;
      };
    }
    isModuleUnification =
      !!this.project.isModuleUnification && this.project.isModuleUnification();
  },
  setupPreprocessorRegistry(type, registry) {
    const context = this;
    // this is called before init, so, we need to check podModulePrefix later (in toTree)
    registry.add("template", {
      name: "ember-template-component-import",
      ext: "hbs",
      toTree: tree => {
        let componentsRoot = null;
        if (!isModuleUnification) {
          const projectConfig = this.project.config();
          const podModulePrefix = projectConfig.podModulePrefix;
  
          // by default `ember g component foo-bar --pod`
          // will create app/components/foo-bar/{component.js,template.hbs}
          // so, we can handle this case and just fallback to 'app/components'
         
          if (podModulePrefix === undefined) {
            componentsRoot = path.join(this.project.root, "app", "components");
          } else {
            componentsRoot = path.join(this.project.root, podModulePrefix);
          }
        } else {
          componentsRoot = path.join(this.project.root);
        }
    const podModulePrefix = this.project.config().podModulePrefix;

    assert.notStrictEqual(
      podModulePrefix,
      undefined,
      `${this.name}: 'podModulePrefix' has not been defined in config/environment.js`
    );
    registry.add('template', {
      name: 'ember-template-component-import',
      ext: 'hbs',
      toTree: (tree) => {
        let componentsRoot = path.join(this.project.root, podModulePrefix);
        tree = new TemplateImportProcessor(tree, { root: componentsRoot });
        return tree;
      }
    });

    if (type === "parent") {
      this.parentRegistry = registry;
    }
  }
};
