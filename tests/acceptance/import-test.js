import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | import', function(hooks) {
  setupApplicationTest(hooks);

  test('Import works', async function(assert) {
    await visit('/');
    assert.equal(find('.global-button').innerText, "I'm a globally referenced button");
    assert.equal(find('.local-button').innerText, "I'm a locally referenced button");
  });
});
