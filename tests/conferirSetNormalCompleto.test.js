const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/const conferirSetNormalCompleto = \((a, b)\) => {([\s\S]*?)};/);
if (!match) {
    throw new Error('Function conferirSetNormalCompleto not found in index.html');
}

const funcBodyStr = match[0].replace('const conferirSetNormalCompleto = ', '');
const conferirSetNormalCompleto = eval(funcBodyStr);

test('conferirSetNormalCompleto', async (t) => {
    await t.test('Set ends at 6 when opponent has 4 or less', () => {
        assert.strictEqual(conferirSetNormalCompleto(6, 0), true, '6-0');
        assert.strictEqual(conferirSetNormalCompleto(0, 6), true, '0-6');
        assert.strictEqual(conferirSetNormalCompleto(6, 4), true, '6-4');
        assert.strictEqual(conferirSetNormalCompleto(4, 6), true, '4-6');
    });

    await t.test('Set ends at 7 when opponent has 5 or 6', () => {
        assert.strictEqual(conferirSetNormalCompleto(7, 5), true, '7-5');
        assert.strictEqual(conferirSetNormalCompleto(5, 7), true, '5-7');
        assert.strictEqual(conferirSetNormalCompleto(7, 6), true, '7-6');
        assert.strictEqual(conferirSetNormalCompleto(6, 7), true, '6-7');
    });

    await t.test('Set is incomplete if neither player reached 6', () => {
        assert.strictEqual(conferirSetNormalCompleto(0, 0), false, '0-0');
        assert.strictEqual(conferirSetNormalCompleto(5, 4), false, '5-4');
        assert.strictEqual(conferirSetNormalCompleto(5, 5), false, '5-5');
    });

    await t.test('Set is incomplete at 6-5 (requires 7 to win)', () => {
        assert.strictEqual(conferirSetNormalCompleto(6, 5), false, '6-5');
        assert.strictEqual(conferirSetNormalCompleto(5, 6), false, '5-6');
    });

    await t.test('Edge/Invalid scores correctly return false based on logic', () => {
        assert.strictEqual(conferirSetNormalCompleto(7, 4), false, '7-4 is invalid');
        assert.strictEqual(conferirSetNormalCompleto(4, 7), false, '4-7 is invalid');
        assert.strictEqual(conferirSetNormalCompleto(8, 6), false, '8-6 max is 7');
        assert.strictEqual(conferirSetNormalCompleto(7, 7), false, '7-7 max is 7');
    });
});
