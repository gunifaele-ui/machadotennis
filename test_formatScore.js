const assert = require('assert');
const formatScore = require('./formatScore.js');

console.log("Running formatScore tests...");

// Test happy paths
// 2 Sets
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 4, set2_j1: 6, set2_j2: 3 }),
    '6-4, 6-3',
    'Failed on 2 sets normal score'
);

// 3 Sets
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 4, set2_j1: 3, set2_j2: 6, set3_j1: 7, set3_j2: 5 }),
    '6-4, 3-6, 7-5',
    'Failed on 3 sets normal score'
);

// Edge cases and error conditions
// Missing 3rd set properties (should be undefined, so it shouldn't be formatted)
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 4, set2_j1: 6, set2_j2: 3, set3_j1: undefined, set3_j2: undefined }),
    '6-4, 6-3',
    'Failed on explicitly undefined 3rd set'
);

// Null 3rd set properties (Vue reactive models might initialize with null)
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 4, set2_j1: 6, set2_j2: 3, set3_j1: null, set3_j2: null }),
    '6-4, 6-3',
    'Failed on explicitly null 3rd set'
);

// Incomplete 3rd set properties
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 4, set2_j1: 6, set2_j2: 3, set3_j1: 2 }),
    '6-4, 6-3',
    'Failed when only one 3rd set property is defined'
);

// 0-score scenarios
assert.strictEqual(
    formatScore({ set1_j1: 6, set1_j2: 0, set2_j1: 0, set2_j2: 6, set3_j1: 0, set3_j2: 0 }),
    '6-0, 0-6, 0-0',
    'Failed on 0 scores in all sets'
);

console.log("All tests passed! ✨");
