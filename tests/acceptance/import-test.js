import { module, test } from 'qunit';
import { visit, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | import', function(hooks) {
  setupApplicationTest(hooks);

  test('Import works', async function(assert) {
    await visit('/');
    assert.equal(find('.global-button').innerText, "I'm a globally referenced button");
    assert.equal(find('.local-button').innerText, "I'm a locally referenced button");
    assert.equal(find('[data-test-name="incorrectlyCamelCasedAbsoluteImport"]').innerText, 'ember-template-component-import: Warning! "incorrectlyCamelCasedAbsoluteImport" is not allowed as Variable name for Template import');
    assert.equal(find('[data-test-name="incorrectlyCamelCasedRelativeImport"]').innerText, 'ember-template-component-import: Warning! "incorrectlyCamelCasedRelativeImport" is not allowed as Variable name for Template import');
    assert.equal(find('[data-test-name="Pseudo_Valid_Global"]').innerText, 'ember-template-component-import: Warning! "Pseudo_Valid_Global" is not allowed as Variable name for Template import');
    assert.equal(find('[data-test-name="Pseudo_Valid_Local"]').innerText, 'ember-template-component-import: Warning! "Pseudo_Valid_Local" is not allowed as Variable name for Template import');
    assert.equal(findAll('[data-test-global-warn]').length, 4);
    assert.equal(findAll('.global-button').length, 3);
    assert.equal(findAll('.local-button').length, 3);
  });
});
