'use strict';
/* eslint-env jest */
/* eslint-env node */
function assert(left, right) {
    expect(left).toEqual(right);
}
const { sep, join } = require('path');
const { isValidVariableName, transformImports, getAbsoluteImportPath, getModuleRelatedImportPath } = require('./utils');

function normalizePath(importPath) {
    if (importPath.includes(':')) {
        const parts = importPath.split('/');
        parts.shift();
        return '/' + parts.join('/');
    } else {
        return importPath;
    }
}

test('it must check isValidVariableName', ()=>{
    assert(isValidVariableName('foo'), false);
    assert(isValidVariableName('Foo-Bar'), false);
    assert(isValidVariableName('Foo'), true);
    assert(isValidVariableName('FooBar'), true);
});

test('getAbsoluteImportPath must return valid paths', ()=>{
    assert(normalizePath(getAbsoluteImportPath('/some/root', './foo')), '/some/foo');
    assert(normalizePath(getAbsoluteImportPath('/some/root/boot', './../foo')), '/some/foo');
    assert(normalizePath(getAbsoluteImportPath('/some/root/boot', './../../foo')), '/foo');
});

test('getModuleRelatedImportPath must return related import', ()=>{
    assert(normalizePath(getModuleRelatedImportPath('/some/root', '/some/root')), '');
    const rootPath = join(__dirname, '..');
    const filePath = join(rootPath, 'lib');
    assert(getModuleRelatedImportPath(rootPath, filePath), 'lib');
    assert(getModuleRelatedImportPath(rootPath, join(filePath, 'utils.test.js')), 'lib/utils.test.js');
});

test('it must transform imports transformImports', ()=>{
    const root = ['src','ui'].join(sep);
    const fileName = ['parent-component', 'child-component', 'template.hbs'].join(sep);
    assert(transformImports('', 'foo', root), { imports: [], rewrittenContents: ''});
    assert(transformImports(`{{import Foo from 'foo-bar/baz'}}`, 'foo.hbs', root), { imports: [
        {
            importPath: "foo-bar/baz",
            isLocalNameValid: true,
            localName: "Foo"
        }
    ], rewrittenContents: ''});
    assert(transformImports(`{{import Foo from 'foo-bar/baz'}}`, fileName, root), { imports: [
        {
            importPath: "foo-bar/baz",
            isLocalNameValid: true,
            localName: "Foo"
        }
    ], rewrittenContents: ''});
    assert(transformImports(`{{import Foo from './foo-bar/baz'}}`, fileName, root), { imports: [
        {
            importPath: "../../parent-component/child-component/foo-bar/baz",
            isLocalNameValid: true,
            localName: "Foo"
        }
    ], rewrittenContents: ''});
});