const { URI } = require('vscode-uri');
const { promises: fs } = require('fs');

async function onComplete(_projectRoot, opts) {
  console.log(_projectRoot);
  // if (opts.focusPath.node.type === 'ElementNode') {
  //   let filePath = uriToPath(opts.textDocument.uri);

  //   if (filePath) {
  //     let content = await fs.readFile(filePath, 'utf-8');
  //     let mightHaveImports = content.includes('import');
  //     if (!mightHaveImports) {
  //       return [];
  //     }
  //     console.log(content);
  //   }
    // console.log(projectRoot, opts);
    return [
      {
        type: 'COMPONENT',
        name: 'MyCustomComponent',
      },
      {
        type: 'COMPONENT',
        name: 'MyHardcodedComponent',
      },
    ];
  // }

  // return [];
};

module.exports.onComplete = onComplete;

function uriToPath(stringUri) {
	const uri = URI.parse(stringUri);
	if (uri.scheme !== 'file') {
			return undefined;
	}
	return uri.fsPath;
}