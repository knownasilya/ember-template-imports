/* global module */
'use strict';

const path = require('path');
const { toComponentFileName } = require('./utils');
const FRONTMATTER_REGEX = /^---\s*[\r\n]([\S\s]+)---\s*[\r\n]/;

function extractStatements(leftImportPart) {
  let normalizedLeft = leftImportPart.replace(/[{}]+/g, ' ').trim();
  const statements = normalizedLeft
    .trim()
    .split(',')
    .map((name) => name && name.trim())
    .filter((name) => name.length);
  return statements;
}

function splitImportExpressions(line) {
  return line
    .split('import')
    .map((item) => item.trim())
    .filter((text) => text.length)
    .map((i) => i.split(' from '));
}

function normalizeRightImportPart(right) {
  let importSt = right
    .replace(/[^a-zA-Z0-9-.@]+/g, ' ')
    .trim()
    .split(' ')
    .join('/');
  return importSt;
}

function hasImportAlias(name) {
  return name.split(' as ').length === 2;
}

function processImports(importStatements) {
  const cleanImports = splitImportExpressions(importStatements);

  const results = cleanImports.map(([left, right]) => {
    let result = {};
    let importSt = normalizeRightImportPart(right);
    result.importLocation = importSt;

    if (left.includes('{')) {
      result.namedImports = [];
      let baseImportPath = importSt;
      // we have multiple imports from path, like
      // import { Foo, Bar, Baz } from './-components';
      if (!baseImportPath.endsWith('/')) {
        baseImportPath = baseImportPath + '/';
      }
      const statements = extractStatements(left);
      statements.forEach((name) => {
        let originalName = name.trim();
        let localName;
        let componentFileName;

        if (hasImportAlias(name)) {
          const [original, newName] = name.split(' as ');
          componentFileName = toComponentFileName(original);
          localName = newName;
          originalName = original;
        } else {
          componentFileName = toComponentFileName(name);
          localName = originalName;
        }

        // if (isRelativeImport(importPath)) {
        //   importPath = getAbsoluteImportPath(templatePath, importPath);
        //   importPath = getModuleRelatedImportPath(
        //     componentsRootPath,
        //     importPath
        //   );
        // }

        result.namedImports.push({
          localName,
          originalName,
          componentFileName,
          isLocalNameValid: isValidVariableName(localName),
        });
      });
    } else {
      // plain single component import by final path, like
      // import InputForm from './-components/input-form';
      let name = left.trim();
      let componentFileName = path.basename(importSt);

      // if (isRelativeImport(importPath)) {
      //   importPath = getAbsoluteImportPath(templatePath, importPath);
      //   importPath = getModuleRelatedImportPath(componentsRootPath, importPath);
      // }

      result.defaultImport = {
        localName: name,
        originalName: name,
        componentFileName,
        isLocalNameValid: isValidVariableName(name),
      };
    }
    return result;
  });

  return results;
}

function isValidVariableName(name) {
  if (!/^[A-Za-z0-9]+$/.test(name)) {
    return false;
  }
  if (name.charAt(0).toUpperCase() !== name.charAt(0)) {
    return false;
  }
  return true;
}

function hasImports(templateText) {
  return templateText.split(FRONTMATTER_REGEX).length === 3;
}

function extractImports(templateText) {
  if (hasImports(templateText)) {
    const [, importStatements, contentWithoutImports] = templateText.split(
      FRONTMATTER_REGEX
    );
    return { importStatements: importStatements.trim(), contentWithoutImports };
  }

  return {};
}

module.exports.processImports = processImports;
module.exports.hasImports = hasImports;
module.exports.extractImports = extractImports;
module.exports.isValidVariableName = isValidVariableName;
