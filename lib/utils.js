/* jshint node: true */
/* global module, require */
"use strict";
const path = require("path");

const IMPORT_PATTERN = /\{\{\s*import\s+([^\s]+)\s+from\s+['"]([^'"]+)['"]\s*\}\}/gi;


function isValidVariableName(name) {
    if (!/^[A-Za-z0-9]+$/.test(name)) {
      return false;
    }
    if (name.charAt(0).toUpperCase() !== name.charAt(0)) {
      return false;
    }
    return true;
}


function isRelativeImport(importPath) {
    return importPath.startsWith('.');
}

function getAbsoluteImportPath(relativePath, importPath) {
    return path
    .resolve(relativePath, "..", importPath)
    .split(path.sep)
    .join("/");
}

function getModuleRelatedImportPath(root, importPath) {
    return path
    .relative(root, importPath)
    .split(path.sep)
    .join("/");
}

function transformImports(contents, relativePath, root, usingStylesImport) {
    let imports = [];
    let rewrittenContents = contents.replace(
      IMPORT_PATTERN,
      (_, localName, importPath) => {
        if (importPath.endsWith('styles.scoped.scss') && usingStylesImport) {
          return _;
        }
        if (isRelativeImport(importPath)) {
          importPath = getAbsoluteImportPath(relativePath, importPath);
          importPath = getModuleRelatedImportPath(root, importPath);
        }
        imports.push({
          localName,
          importPath,
          isLocalNameValid: isValidVariableName(localName)
        });
        return "";
      }
    );
    return { imports, rewrittenContents };
}

function createImportWarning(relativePath, localName, isLocalNameValid, _console) {
    const warnPrefix = "ember-template-component-import: ";
    const abstractWarn = `${warnPrefix} Allowed import variable names - CamelCased strings, like: FooBar, TomDale`;
    const componentWarn = `
    ${warnPrefix}Warning!
    in file: "${relativePath}"
    subject: "${localName}" is not allowed as Variable name for Template import.`;
    const warn = isLocalNameValid
      ? ""
      : `
    <pre data-test-name="${localName}">${componentWarn}</pre>
    <pre data-test-global-warn="${localName}">${abstractWarn}</pre>
  `;
    if (!isLocalNameValid) {
      _console.log(componentWarn);
      if (relativePath !== "dummy/pods/application/template.hbs") {
        // don't throw on 'dummy/pods/application/template.hbs' (test template)
        throw new Error(componentWarn);
      }
    }
    return warn;
}

module.exports.isValidVariableName = isValidVariableName;
module.exports.IMPORT_PATTERN = IMPORT_PATTERN;
module.exports.transformImports = transformImports;
module.exports.createImportWarning = createImportWarning;
module.exports.getAbsoluteImportPath = getAbsoluteImportPath;
module.exports.getModuleRelatedImportPath = getModuleRelatedImportPath;