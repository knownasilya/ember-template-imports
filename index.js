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

        tree = new TemplateImportProcessor(tree, { root: componentsRoot });
        return tree;
      }
    });

    if (type === "parent") {
      this.parentRegistry = registry;
    }
  }
};
