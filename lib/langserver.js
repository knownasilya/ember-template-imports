const { URI } = require('vscode-uri');
const { extractImports, processImports } = require('./extract-imports');

async function onComplete(projectRoot, opts) {
  function log() {
    return opts.server.connection.console.log(...arguments);
  }

  if (opts.focusPath.node.type === 'ElementNode') {
    const document = opts.server.documents.get(opts.textDocument.uri);
    const content = document.getText();

    if (content) {
      let mightHaveImports = content.includes('---');
      if (!mightHaveImports) {
        return [];
      }
      let filePath = uriToPath(opts.textDocument.uri);
      let { importStatements } = extractImports(content, filePath);

      if (!importStatements) {
        return [];
      }

      const statements = processImports(importStatements);
      const imports = statements.reduce((all, statement) => {
        if (
          statement.defaultImport &&
          statement.defaultImport.isLocalNameValid
        ) {
          all.push(statement.defaultImport);
        } else if (statement.namedImports) {
          let valid = statement.namedImports.filter(
            (imp) => imp.isLocalNameValid
          );
          all = all.concat(valid);
        }

        return all;
      }, []);

      if (imports) {
        log(imports);
        return imports.map((imp) => {
          return {
            kind: 7,
            label: imp.localName,
            detail: `Imported from '${imp.importPath}'`,
            sortText: `0-${imp.localName}-${imp.importPath}`,
          };
        });
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
