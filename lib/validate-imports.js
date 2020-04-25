'use strict';

const path = require('path');
const dirTree = require('directory-tree');
const { titleize } = require('./utils');

const podsComponentFiles = ['template.hbs', 'component.js', 'component.ts'];
const componentsFolderExtensions = ['.js', '.ts', '.hbs'];

function usingDefaultImports(statement, importPath) {
  if (statement.includes('{') && !importPath.startsWith('.')) {
    let split = importPath.split('/');

    // handle org modules
    if (importPath.startsWith('@')) {
      return split.length === 2;
    }

    return split.length === 1;
  }

  return false;
}

function findLocalComponents(root, layoutType) {
  let results = dirTree(root, {
    extensions: /\.(js|ts|hbs)$/,
  });
  if (results && results.children) {
    return results.children.reduce((all, child) => {
      switch (layoutType) {
        case 'pods': {
          if (child.type !== 'directory' || !child.children) {
            return;
          }
          let componentFiles = child.children.filter((child) =>
            podsComponentFiles.includes(child.name)
          );

          if (componentFiles.length !== 0) {
            all.push({
              name: child.name,
              componentName: titleize(child.name),
            });
          }
          break;
        }

        case 'classic':
        default: {
          // Check templates in app/templates/components/*.hbs
          if (
            child.name === 'templates' &&
            child.type === 'directory' &&
            child.children
          ) {
            let componentsFolder = child.children.find(
              (child) =>
                child.type === 'directory' && child.name === 'components'
            );
            if (!componentsFolder) {
              return;
            }
            componentsFolder.children.forEach((template) => {
              let name = template.name.replace(template.extension, '');
              let found = all.find((item) => item.name === name);
              if (!found) {
                all.push({
                  name,
                  componentName: titleize(name),
                });
              }
            });
            // test app/components/*.{js,ts}
          } else if (
            child.name === 'components' &&
            child.type === 'directory' &&
            child.children
          ) {
            child.children.forEach((jsFile) => {
              if (!componentsFolderExtensions.includes(jsFile.extension)) {
                return;
              }
              let name = jsFile.name.replace(jsFile.extension, '');
              let found = all.find((item) => item.name === name);
              if (!found) {
                all.push({
                  name,
                  componentName: titleize(name),
                });
              }
            });
          }
          break;
        }
      }

      return all;
    }, []);
  }
  return results;
}

module.exports.findLocalComponents = findLocalComponents;
module.exports.usingDefaultImports = usingDefaultImports;
