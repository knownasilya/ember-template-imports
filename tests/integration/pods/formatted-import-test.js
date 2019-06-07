import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | different-imports', function(hooks) {
  setupRenderingTest(hooks);

  test('it can handle spaces, tabbed, multilined imports', async function(assert) {
    await render(hbs`{{different-imports}}`);
    assert.equal(findAll('button').length, 6);
  });
});
