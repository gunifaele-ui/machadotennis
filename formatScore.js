const formatScore = (m) => {
    let s = `${m.set1_j1}-${m.set1_j2}, ${m.set2_j1}-${m.set2_j2}`;
    if (m.set3_j1 !== null && m.set3_j2 !== null && m.set3_j1 !== undefined && m.set3_j2 !== undefined) {
        s += `, ${m.set3_j1}-${m.set3_j2}`;
    }
    return s;
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = formatScore;
}
