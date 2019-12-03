/* global module */
"use strict";

const OCTANE_IMPORT_SPLITTER = /---\s?hbs\s?---/;

function dasherizeName(name = "") {
  const result = [];
  const nameSize = name.length;
  if (!nameSize) {
    return "";
  }
  result.push(name.charAt(0));
  for (let i = 1; i < nameSize; i++) {
    let char = name.charAt(i);
    if (char === char.toUpperCase()) {
      if (char !== "-" && char !== "/" && char !== "_") {
        if (
          result[result.length - 1] !== "-" &&
          result[result.length - 1] !== "/"
        ) {
          result.push("-");
        }
      }
    }
    result.push(char);
  }
  return result.join("");
}

function toComponentFileName(name) {
  return dasherizeName(name.trim()).toLowerCase();
}

function extractStatements(leftImportPart) {
  let normalizedLeft = leftImportPart.replace(/[{}]+/g, " ").trim();
  const statements = normalizedLeft
    .trim()
    .split(",")
    .map(name => name && name.trim())
    .filter(name => name.length);
  return statements;
}

function splitImportExpressions(line) {
  return line
    .split("import")
    .map(item => item.trim())
    .filter(text => text.length)
    .map(i => i.split(" from "));
}

function normalizeRightImportPart(right) {
  let importSt = right
    .replace(/[^a-zA-Z0-9-.@]+/g, " ")
    .trim()
    .split(" ")
    .join("/");
  return importSt;
}

function hasImportAlias(name) {
  return name.split(" as ").length === 2;
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
      statements.forEach(name => {
        if (hasImportAlias(name)) {
          const [originalName, newName] = name.split(' as ');
          components.push([
            newName.trim(),
            importSt + toComponentFileName(originalName)
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

function hasOctaneImports(templateText) {
  return templateText.split(OCTANE_IMPORT_SPLITTER).length === 2;
}

function transformOctaneImports(templateText, relativePath) {
  if (!relativePath) {
    return templateText;
  }
  const [importStatements, templateContent] = templateText.split(
    OCTANE_IMPORT_SPLITTER
  );
  return [toLegacyImport(importStatements), templateContent].join(
    "\n"
  );
}

module.exports.dasherizeName = dasherizeName;
module.exports.toLegacyImport = toLegacyImport;
module.exports.hasOctaneImports = hasOctaneImports;
module.exports.transformOctaneImports = transformOctaneImports;
