import assert from "node:assert";
import { validateSetInput } from "../js/validators.js";

function runTests() {
    console.log("Running validateSetInput tests...");

    // Happy paths
    assert.strictEqual(validateSetInput(5), 5, "Should return 5 for input 5");
    assert.strictEqual(validateSetInput("42"), 42, "Should parse string '42' to 42");
    assert.strictEqual(validateSetInput(0), 0, "Should allow 0");
    assert.strictEqual(validateSetInput(99), 99, "Should allow 99");

    // Negative numbers
    assert.strictEqual(validateSetInput(-1), 0, "Should return 0 for negative numbers");
    assert.strictEqual(validateSetInput("-50"), 0, "Should return 0 for string negative numbers");

    // Over 99
    assert.strictEqual(validateSetInput(100), 99, "Should cap at 99 for inputs > 99");
    assert.strictEqual(validateSetInput("105"), 99, "Should cap at 99 for string inputs > 99");
    assert.strictEqual(validateSetInput(9999), 99, "Should cap at 99 for very large inputs");

    // NaN / Invalid inputs
    assert.strictEqual(validateSetInput("abc"), 0, "Should return 0 for non-numeric strings");
    assert.strictEqual(validateSetInput(NaN), 0, "Should return 0 for NaN");
    assert.strictEqual(validateSetInput(null), 0, "Should return 0 for null");
    assert.strictEqual(validateSetInput(undefined), 0, "Should return 0 for undefined");
    assert.strictEqual(validateSetInput({}), 0, "Should return 0 for objects");

    // Float parsing (parseInt truncates)
    assert.strictEqual(validateSetInput(5.9), 5, "Should parse floats correctly (truncate)");
    assert.strictEqual(validateSetInput("3.14"), 3, "Should parse float strings correctly (truncate)");

    console.log("All tests passed!");
}

runTests();
