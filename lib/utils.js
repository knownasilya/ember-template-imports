'use strict';

const path = require('path');

function createImportWarning(
  relativePath,
  localName,
  isLocalNameValid,
  _console
) {
  const warnPrefix = 'ember-template-imports: ';
  const abstractWarn = `${warnPrefix} Allowed import variable names - CamelCased strings, like: FooBar, TomDale`;
  const componentWarn = `
    ${warnPrefix}Warning!
    in file: "${relativePath}"
    subject: "${localName}" is not allowed as Variable name for Template import.`;
  const warn = isLocalNameValid
    ? ''
    : `
    <pre data-test-name="${localName}">${componentWarn}</pre>
    <pre data-test-global-warn="${localName}">${abstractWarn}</pre>
  `;
  if (!isLocalNameValid) {
    _console.log(componentWarn);
    if (relativePath !== 'dummy/pods/application/template.hbs') {
      // don't throw on 'dummy/pods/application/template.hbs' (test template)
      throw new Error(componentWarn);
    }
  }
  return warn;
}

function dasherizeName(name = '') {
  const result = [];
  const nameSize = name.length;
  if (!nameSize) {
    return '';
  }
  result.push(name.charAt(0));
  for (let i = 1; i < nameSize; i++) {
    let char = name.charAt(i);
    if (char === char.toUpperCase()) {
      if (char !== '-' && char !== '/' && char !== '_') {
        if (
          result[result.length - 1] !== '-' &&
          result[result.length - 1] !== '/'
        ) {
          result.push('-');
        }
      }
    }
    result.push(char);
  }
  return result.join('');
}

function toComponentFileName(name) {
  return dasherizeName(name.trim()).toLowerCase();
}

function titleize(value) {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected a string, got a ${typeof string}`);
  }

  return value
    .toLowerCase()
    .replace(/(?:^|\s|-|\/)\S/g, function (m) {
      return m.toUpperCase();
    })
    .replace(/-/g, '');
}

function isRelativeImport(importPath) {
  return importPath.startsWith('.');
}

function getAbsoluteImportPath(relativePath, importPath) {
  return path.resolve(relativePath, '..', importPath).split(path.sep).join('/');
}

function getModuleRelatedImportPath(root, importPath) {
  return path.relative(root, importPath).split(path.sep).join('/');
}

module.exports.titleize = titleize;
module.exports.dasherizeName = dasherizeName;
module.exports.toComponentFileName = toComponentFileName;
module.exports.createImportWarning = createImportWarning;
module.exports.getAbsoluteImportPath = getAbsoluteImportPath;
module.exports.getModuleRelatedImportPath = getModuleRelatedImportPath;
module.exports.isRelativeImport = isRelativeImport;
