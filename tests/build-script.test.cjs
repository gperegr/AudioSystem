const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {buildOutput, checkOutput, sections} = require('../tools/build-script.cjs');

const root = path.resolve(__dirname, '..');

test('browser entry point is generated from the ordered application source sections', () => {
    const generated = buildOutput();
    assert.equal(sections.length, 21);
    assert.equal(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), generated);
    assert.doesNotThrow(() => checkOutput(generated));
    assert.doesNotThrow(() => new vm.Script(generated, {filename:'script.js'}));
});

test('domain state loads before the application that consumes it',()=>{
    const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
    assert.ok(html.indexOf('src="./src/modules/application-state.js')<html.indexOf('src="./script.js'));
});
