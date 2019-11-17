import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | js-imports', function(hooks) {
  setupRenderingTest(hooks);

  test('it basics', async function(assert) {
    await render(hbs`<JsImports/>`);
    assert.equal(findAll('button').length, 1);
  });
});
