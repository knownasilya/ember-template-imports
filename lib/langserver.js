const { URI } = require('vscode-uri');
const { extractImports, processImports } = require('./extract');

async function onComplete(projectRoot, opts) {
  function log() {
    return opts.server.connection.console.log(...arguments);
  }

  if (opts.focusPath.node.type === 'ElementNode') {
    const document = opts.server.documents.get(opts.textDocument.uri);
    const content = document.getText();

    if (content) {
      let mightHaveImports = content.includes('import');
      if (!mightHaveImports) {
        return [];
      }
      let filePath = uriToPath(opts.textDocument.uri);
      let { importStatements } = extractImports(content, filePath);

      if (!importStatements) {
        return [];
      }

      const imports = processImports(importStatements, filePath, projectRoot);

      if (imports) {
        log(imports);
        return imports.reduce((all, imp) => {
          if (imp.isLocalNameValid) {
            all.push({
              kind: 7,
              label: imp.localName,
              detail: `Imported from '${imp.importPath}'`,
              sortText: `0-${imp.localName}-${imp.importPath}`,
            });
          }
          return all;
        }, []);
      }
    }
  }

  return [];
}

module.exports.onComplete = onComplete;

function uriToPath(stringUri) {
  const uri = URI.parse(stringUri);
  if (uri.scheme !== 'file') {
    return undefined;
  }
  return uri.fsPath;
}
