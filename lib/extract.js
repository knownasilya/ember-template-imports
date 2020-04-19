/* global module */
'use strict';

const path = require('path');
const FRONTMATTER_REGEX = /^---\s*[\r\n]([\S\s]+)---\s*[\r\n]/;

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

function toLegacyImport(line) {
  var cleanImports = splitImportExpressions(line);
  const components = [];

  cleanImports.map(([left, right]) => {
    let importSt = normalizeRightImportPart(right);
    if (left.includes('{')) {
      // we have multiple imports from path, like
      // import { Foo, Bar, Baz } from './-components';
      if (!importSt.endsWith('/')) {
        importSt = importSt + '/';
      }
      const statements = extractStatements(left);
      statements.forEach((name) => {
        if (hasImportAlias(name)) {
          const [originalName, newName] = name.split(' as ');
          components.push([
            newName.trim(),
            importSt + toComponentFileName(originalName),
          ]);
        } else {
          components.push([name.trim(), importSt + toComponentFileName(name)]);
        }
      });
    } else {
      // plain single component import by final path, like
      // import InputForm from './-components/input-form';
      components.push([left.trim(), importSt]);
    }
  });
  let results = [];

  components.forEach(([head, rawTail]) => {
    results.push(`{{import ${head} from "${rawTail}"}}`);
  });

  return results.join('\n');
}

function processImports(importStatements, relativePath, root) {
  const cleanImports = splitImportExpressions(importStatements);

  return cleanImports.reduce((imports, [left, right]) => {
    let importSt = normalizeRightImportPart(right);
    if (left.includes('{')) {
      // we have multiple imports from path, like
      // import { Foo, Bar, Baz } from './-components';
      if (!importSt.endsWith('/')) {
        importSt = importSt + '/';
      }
      const statements = extractStatements(left);
      statements.forEach((name) => {
        let originalName = name.trim();
        let importPath;
        let localName;

        if (hasImportAlias(name)) {
          const [original, newName] = name.split(' as ');
          importPath = importSt + toComponentFileName(originalName);
          localName = newName;
          originalName = original;
        } else {
          importPath = importSt + toComponentFileName(name);
          localName = originalName;
        }
        debugger;
        if (isRelativeImport(importPath)) {
          importPath = getAbsoluteImportPath(relativePath, importPath);
          importPath = getModuleRelatedImportPath(root, importPath);
        }

        imports.push({
          localName,
          originalName,
          importPath,
          isLocalNameValid: isValidVariableName(localName),
        });
      });
    } else {
      // plain single component import by final path, like
      // import InputForm from './-components/input-form';
      let name = left.trim();
      let importPath = importSt;

      if (isRelativeImport(importPath)) {
        importPath = getAbsoluteImportPath(relativePath, importPath);
        importPath = getModuleRelatedImportPath(root, importPath);
      }

      imports.push({
        localName: name,
        originalName: name,
        importPath,
        isLocalNameValid: isValidVariableName(name),
      });
    }

    return imports;
  }, []);
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

function isRelativeImport(importPath) {
  return importPath.startsWith('.');
}

function getAbsoluteImportPath(relativePath, importPath) {
  return path.resolve(relativePath, '..', importPath).split(path.sep).join('/');
}

function getModuleRelatedImportPath(root, importPath) {
  return path.relative(root, importPath).split(path.sep).join('/');
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

module.exports.dasherizeName = dasherizeName;
module.exports.processImports = processImports;
module.exports.hasImports = hasImports;
module.exports.extractImports = extractImports;
module.exports.isValidVariableName = isValidVariableName;
module.exports.getAbsoluteImportPath = getAbsoluteImportPath;
module.exports.getModuleRelatedImportPath = getModuleRelatedImportPath;
