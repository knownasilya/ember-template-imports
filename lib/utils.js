/* jshint node: true */
/* global module, require */
'use strict';

function createImportWarning(
  relativePath,
  localName,
  isLocalNameValid,
  _console
) {
  const warnPrefix = 'ember-template-component-import: ';
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

module.exports.createImportWarning = createImportWarning;
