const { createImportWarning } = require('./utils');

function rewriteTemplate({ templatePath, templateContents, imports, ui }) {
  let validImports = imports
    .map(({ importPath, localName, isLocalNameValid, errors }) => {
      if (errors) {
        errors.forEach((error) => {
          ui.writeWarnLine(error);
        });
        return '';
      }
      const warn = createImportWarning(
        templatePath,
        localName,
        isLocalNameValid,
        this._console
      );
      let componentName = `(component '${importPath}')`;

      return `${warn}{{#let ${componentName} as |${localName}|}}`;
    })
    .filter((i) => i);

  let header = validImports.join('');
  let footer = validImports.map(() => `{{/let}}`).join('');
  let result = header + templateContents + footer;
  return result;
}

module.exports.rewriteTemplate = rewriteTemplate;
