"use strict";

/* eslint-env node */

const assert = require('assert');
const path = require('path');
const BroccoliFilter = require('broccoli-persistent-filter');
const md5Hex = require('md5-hex');
const { transformImports, createImportWarning } = require('./lib/utils');
const {
  transformOctaneImports,
  hasOctaneImports
} = require('./lib/octane-utils');

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
    this.transformers = options.transformers;
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
      this.options.root,
      this.transformers
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
      .join("");
    let footer = imports.map(() => `{{/let}}`).join("");
    let result = header + rewrittenContents + footer;
    return result;
  }
}

module.exports = {
  name: require("./package").name,

  setupPreprocessorRegistry(type, registry) {
    let plugins = this.loadPlugins();
    let transformers = plugins.reduce((all, plugin) => {
      let opts = plugin.options;
      if (opts.extension) {
        all[opts.extension] = plugin;
      }
      return all;
    }, {});
    this.project.templateImportTransformers = transformers;

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
        tree = new TemplateImportProcessor(tree, { root: componentsRoot, transformers });
        return tree;
      }
    });

    if (type === "parent") {
      this.parentRegistry = registry;
    }
  },

  loadPlugins() {
    const plugins = Object.keys(this.project.addonPackages).reduce((all, name) => {
      let addonInfo = this.project.addonPackages[name];
      let isPlugin = false;
      try {
        isPlugin = addonInfo.pkg.keywords.includes('ember-template-imports-addon');
      } catch(e) {
        isPlugin = false;
      }
      if (isPlugin) {
        let options = addonInfo.pkg.templateImports;

        if (!options) {
          return all;
        }

        all.push({
          name,
          path: addonInfo.path,
          options
        });
      }
      
      return all;
    }, []);

    return plugins;
  }
};
