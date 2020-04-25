'use strict';

const path = require('path');
const dirTree = require('directory-tree');
const { titleize, isRelativeImport } = require('./utils');

const podsComponentFiles = ['template.hbs', 'component.js', 'component.ts'];
const componentsFolderExtensions = ['.js', '.ts', '.hbs'];
const cachedAddons = new Map();

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

function findAppLevelComponents(files, layoutType) {
  return files.reduce((all, child) => {
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
            (child) => child.type === 'directory' && child.name === 'components'
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

function findComponentFiles(root) {
  return dirTree(root, {
    extensions: /\.(js|ts|hbs)$/,
  });
}

function findComponentsInDirectory(files) {
  return files.reduce((all, child) => {
    if (child.type === 'directory' && child.children) {
      let componentFiles = child.children.filter((child) =>
        podsComponentFiles.includes(child.name)
      );

      if (componentFiles.length !== 0) {
        all.push({
          fileName: child.name,
          componentName: titleize(child.name),
        });
      }
    } else if (child.type === 'file') {
      let name = child.name.replace(child.extension, '');
      let validFile = componentsFolderExtensions.includes(child.extension);

      if (!validFile) {
        return all;
      }

      let isScript = child.extension === '.js' || child.extension === '.ts';
      // let notRouteTemplate = child.extension === '.hbs' && name !== 'template';
      // let notController = isScript && name !== 'controller';
      // let notRoute = isScript && name !== 'route';

      if (isScript) {
        all.push({
          fileName: name,
          componentName: titleize(name),
        });
      }
    }

    return all;
  }, []);
}

function getImportType({ projectName, importPath, addonKeys }) {
  if (isRelativeImport(importPath)) {
    return 'local-relative';
  } else if (importPath === projectName) {
    return 'local-defaults';
  } else if (importPath.startsWith(`${projectName}/components`)) {
    return 'local-absolute-components';
  } else if (addonKeys.includes(importPath)) {
    return 'addon-defaults';
  } else if (
    addonKeys.some((name) => importPath.startsWith(`${name}/components`))
  ) {
    return 'addon-absolute-components';
  }
}

function loadComponents({
  importType,
  importPath,
  addons,
  projectName,
  projectDir,
  podModulePrefix,
  localComponentsCache,
}) {
  switch (importType) {
    case 'local-defaults': {
      if (localComponentsCache.length) {
        return localComponentsCache;
      }
      let usingPods = !!podModulePrefix;
      let baseDir = usingPods
        ? path.join(projectDir, 'app', podModulePrefix, 'components')
        : path.join(projectDir, 'app');
      console.log(basedir);
      let files = findComponentFiles(baseDir);

      if (!files || !files.children) {
        return [];
      }
      let components = findAppLevelComponents(
        files,
        usingPods ? 'pods' : 'classic'
      );

      components.forEach((c) => localComponentsCache.push(c));
      return components;
    }

    case 'addon-defaults': {
      let addonName = importPath;
      if (cachedAddons.has(addonName)) {
        return cachedAddons.get(addonName);
      }
      let addon = addons[addonName];
      let componentsPath = path.join(addon.path, 'app', 'components');
      let files = findComponentFiles(componentsPath);

      if (!files || !files.children) {
        return [];
      }
      let components = findComponentsInDirectory(files.children);
      cachedAddons.set(addonName, components);
      return components;
    }

    default:
      return [];
  }
}

function validateImports({
  imports,
  addons,
  projectName,
  projectDir,
  podModulePrefix,
  templatePath,
}) {
  const addonKeys = Object.keys(addons);
  const localComponentsCache = [];
  const results = imports.reduce((all, statement) => {
    const validatedImports = [];
    const importPath = statement.importLocation;
    const importType = getImportType({ projectName, importPath, addonKeys });
    const components = loadComponents({
      importType,
      importPath,
      addons,
      localComponentsCache,
      projectName,
      projectDir,
      templatePath,
      podModulePrefix,
    });

    if (statement.namedImports) {
      statement.namedImports.forEach((imp) => {
        let errors = [];
        let component = components.find(
          (comp) => comp.componentName === imp.originalName
        );

        if (!component) {
          errors.push(
            `Component '${imp.originalName}' imported from the addon '${statement.importLocation}' was not found (${templatePath}).`
          );
        }
        validatedImports.push({
          errors: errors.length ? errors : undefined,
          ...imp,
        });
      });
    } else if (statement.defaultImport) {
      let errors = [];

      if (importType === 'addon-defaults') {
        errors.push(
          `Default imports from '${statement.importLocation}' are not supported. Try named imports instead (${templatePath}).`
        );
      } else if (importType === 'local-defaults') {
        errors.push;
      }

      let component = components.find(
        (comp) => comp.componentName === statement.defaultImport.originalName
      );

      if (!component) {
        errors.push(
          `Component '${statement.defaultImport.originalName}' imported from the addon '${statement.importLocation}' was not found (${templatePath}).`
        );
      }
      validatedImports.push({
        errors: errors.length ? errors : undefined,
        ...statement.defaultImport,
      });
    }

    all = all.concat(validatedImports);
    debugger;

    return all;
  }, []);

  return results;
}

// function validateImport({ import, importedFrom, projectName }) {}

module.exports.validateImports = validateImports;
module.exports.findComponentFiles = findComponentFiles;
module.exports.findComponentsInDirectory = findComponentsInDirectory;
module.exports.findAppLevelComponents = findAppLevelComponents;
module.exports.loadComponents = loadComponents;
module.exports.usingDefaultImports = usingDefaultImports;
