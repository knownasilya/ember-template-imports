import { module, test } from 'qunit';
import { visit, find, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | import', function(hooks) {
  setupApplicationTest(hooks);

  test('Import works', async function(assert) {
    await visit('/');
    assert.equal(find('.global-button').innerText, "I'm a globally referenced button");
    assert.equal(find('.local-button').innerText, "I'm a locally referenced button");
    const incorrectlyCamelCasedAbsoluteImportText = find('[data-test-name="incorrectlyCamelCasedAbsoluteImport"]').innerText;
    const incorrectlyCamelCasedRelativeImportText = find('[data-test-name="incorrectlyCamelCasedRelativeImport"]').innerText;
    const Incorrectly_Snake_Cased_Absolute_ImportText = find('[data-test-name="Incorrectly_Snake_Cased_Absolute_Import"]').innerText;
    const Incorrectly_Snake_Cased_Relative_ImportText = find('[data-test-name="Incorrectly_Snake_Cased_Relative_Import"]').innerText;

    assert.equal(incorrectlyCamelCasedAbsoluteImportText.includes('dummy/pods/application/template.hbs'), true);
    assert.equal(incorrectlyCamelCasedAbsoluteImportText.includes('"incorrectlyCamelCasedAbsoluteImport"'), true);
    assert.equal(incorrectlyCamelCasedRelativeImportText.includes('dummy/pods/application/template.hbs'), true);
    assert.equal(incorrectlyCamelCasedRelativeImportText.includes('"incorrectlyCamelCasedRelativeImport"'), true);

    
    assert.equal(Incorrectly_Snake_Cased_Absolute_ImportText.includes('dummy/pods/application/template.hbs'), true);
    assert.equal(Incorrectly_Snake_Cased_Absolute_ImportText.includes('"Incorrectly_Snake_Cased_Absolute_Import"'), true);
    assert.equal(Incorrectly_Snake_Cased_Relative_ImportText.includes('dummy/pods/application/template.hbs'), true);
    assert.equal(Incorrectly_Snake_Cased_Relative_ImportText.includes('"Incorrectly_Snake_Cased_Relative_Import"'), true);

    assert.equal(findAll('[data-test-global-warn]').length, 4);
    assert.equal(findAll('.global-button').length, 3);
    assert.equal(findAll('.local-button').length, 4);
  });
});
