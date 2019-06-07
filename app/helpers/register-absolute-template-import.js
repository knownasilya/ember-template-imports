/* global require, define */

import { getOwner } from "@ember/application";
import Helper from "@ember/component/helper";

function generateHash(module, testName) {
  var str = module + "\x1C" + testName;
  var hash = 0;

  for (var i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  // Convert the possibly negative integer hash code into an 8 character hex string, which isn't
  // strictly necessary but increases user understanding that the id is a SHA-like hash
  var hex = (0x100000000 + hash).toString(16);
  if (hex.length < 8) {
    hex = "0000000" + hex;
  }

  return hex.slice(-8);
}

function getAppName(appInstance) {
  if (appInstance.base && appInstance.base.name) {
    return appInstance.base.name;
  }
  // TODO: would this work in 2.4+?
  return (
    appInstance.application.name ||
    appInstance.application.modulePrefix ||
    appInstance.application.__registry__.resolver._configRootName ||
    "dummy"
  );
}

function registerComponentAlias(absoluteComponentPath, originalImport) {
  ["", "/template", "/component"].forEach(postfix => {
    const origin = originalImport + postfix;
    if (require.has(origin)) {
      define.exports(absoluteComponentPath + postfix, window.require(origin));
    }
  });
}

function registerAbsoluteImport(templateFileName, originalImport, appName) {
  // idea is - if originalImport does not contain '/src/ui', logic must be bypassed..

  const templateId =
    "imp-" + generateHash(templateFileName, originalImport).slice(0, 5); // f34f3

  if (originalImport.startsWith("/src")) {
    originalImport = appName + originalImport;
  }

  const splitter = "/-components/";
  const componentName = originalImport.split(splitter)[1];
  const localPrefix = `${appName}/src/ui/components/${templateId}/`;
  const absoluteComponentPath = localPrefix + componentName;

  if (!require.has(absoluteComponentPath)) {
    registerComponentAlias(absoluteComponentPath, originalImport);
  }

  return templateId + "/" + componentName;
}

export default Helper.extend({
  compute([one, two]) {
    const appName = getAppName(getOwner(this));
    return registerAbsoluteImport(one, two, appName);
  }
});
