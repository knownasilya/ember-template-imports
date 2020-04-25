const { createImportWarning } = require('./utils');

function rewriteTemplate({ templatePath, templateContents, imports }) {
  let header = imports
    .map(({ importPath, localName, isLocalNameValid }) => {
      const warn = createImportWarning(
        templatePath,
        localName,
        isLocalNameValid,
        this._console
      );
      let componentName = `(component '${importPath}')`;

      return `${warn}{{#let ${componentName} as |${localName}|}}`;
    })
    .join('');
  let footer = imports.map(() => `{{/let}}`).join('');
  let result = header + templateContents + footer;
  return result;
}

module.exports.rewriteTemplate = rewriteTemplate;
