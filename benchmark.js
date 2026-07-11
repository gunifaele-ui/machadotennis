const { performance } = require('perf_hooks');

const NUM_MATCHES = 10000;
const matches = [];
for (let i = 0; i < NUM_MATCHES; i++) {
    matches.push({
        id: i,
        tipo: i % 5 === 0 ? 'amistoso' : 'oficial',
        status: i % 10 === 0 ? 'Incompleto' : 'Finalizado',
        data: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        vencedor_id: i % 2 + 1
    });
}

function runBenchmark() {
    console.log(`Running benchmark with ${NUM_MATCHES} matches...`);

    // Baseline: Creating sortedMatches and dashboardMatches
    const sortedMatches = () => [...matches].sort((a, b) => new Date(b.data) - new Date(a.data));
    const dashboardMatches = (sorted) => sorted.filter(m => m.tipo === 'oficial');

    let sm, dm;
    const t0 = performance.now();
    for (let i=0; i<100; i++) {
        sm = sortedMatches();
        dm = dashboardMatches(sm);
    }
    const t1 = performance.now();
    console.log(`Base setup (100x): ${(t1 - t0).toFixed(2)}ms`);

    // Old sequenciaAtual
    const t2 = performance.now();
    for (let i=0; i<100; i++) {
        const oficiaisFinalizadas = [...matches]
            .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
            .sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    const t3 = performance.now();
    console.log(`Old sequenciaAtual (100x): ${(t3 - t2).toFixed(2)}ms`);

    // New sequenciaAtual
    const t4 = performance.now();
    for (let i=0; i<100; i++) {
        const oficiaisFinalizadas = dm.filter(m => m.status !== 'Incompleto');
    }
    const t5 = performance.now();
    console.log(`New sequenciaAtual (100x): ${(t5 - t4).toFixed(2)}ms`);

    // Old maiorSequenciaHistorica
    const t6 = performance.now();
    for (let i=0; i<100; i++) {
        const oficiaisFinalizadasCr = [...matches]
            .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
            .sort((a, b) => new Date(a.data) - new Date(b.data));
    }
    const t7 = performance.now();
    console.log(`Old maiorSequenciaHistorica (100x): ${(t7 - t6).toFixed(2)}ms`);

    // New maiorSequenciaHistorica
    const t8 = performance.now();
    for (let i=0; i<100; i++) {
        const oficiaisFinalizadasCr = [...dm]
            .filter(m => m.status !== 'Incompleto')
            .reverse();
    }
    const t9 = performance.now();
    console.log(`New maiorSequenciaHistorica (100x): ${(t9 - t8).toFixed(2)}ms`);
}

runBenchmark();
