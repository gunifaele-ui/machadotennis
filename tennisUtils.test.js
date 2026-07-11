import test from 'node:test';
import assert from 'node:assert/strict';
import { conferirSuperTieCompleto } from './tennisUtils.js';

test('conferirSuperTieCompleto tests', async (t) => {
    await t.test('Happy paths', () => {
        // Win by exactly 2
        assert.equal(conferirSuperTieCompleto(10, 8), true);
        assert.equal(conferirSuperTieCompleto(8, 10), true);
        assert.equal(conferirSuperTieCompleto(12, 10), true);
        assert.equal(conferirSuperTieCompleto(10, 12), true);
        // Win by more than 2
        assert.equal(conferirSuperTieCompleto(15, 5), true);
        assert.equal(conferirSuperTieCompleto(2, 10), true);
    });

    await t.test('Edge cases', () => {
        // Reached 10 but not win by 2
        assert.equal(conferirSuperTieCompleto(10, 9), false);
        assert.equal(conferirSuperTieCompleto(9, 10), false);
        // Above 10 but not win by 2
        assert.equal(conferirSuperTieCompleto(11, 10), false);
        assert.equal(conferirSuperTieCompleto(10, 11), false);
        // Win by 2 but not reached 10
        assert.equal(conferirSuperTieCompleto(9, 7), false);
        assert.equal(conferirSuperTieCompleto(7, 9), false);
    });

    await t.test('Boundary conditions', () => {
        assert.equal(conferirSuperTieCompleto(0, 0), false);
        assert.equal(conferirSuperTieCompleto(10, 0), true);
        assert.equal(conferirSuperTieCompleto(0, 10), true);
    });
});
