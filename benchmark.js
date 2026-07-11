const { performance } = require('perf_hooks');

const players = {
    value: Array.from({length: 50}, (_, i) => ({
        docId: `player_${i}`,
        name: `Player ${i}`,
        photo: `photo_${i}.jpg`
    }))
};

const window = {
    FB: {
        db: {},
        doc: (db, collection, id) => `${collection}/${id}`,
        setDoc: async (docRef, data) => {
            // Simulate network latency (e.g., 50ms)
            return new Promise(resolve => setTimeout(resolve, 50));
        }
    }
};

async function benchmarkSequential() {
    const start = performance.now();
    for (const p of players.value) {
        await window.FB.setDoc(window.FB.doc(window.FB.db, "jogadores", p.docId), {
            name: p.name,
            photo: p.photo
        });
    }
    const end = performance.now();
    return end - start;
}

async function benchmarkParallel() {
    const start = performance.now();
    await Promise.all(players.value.map(p =>
        window.FB.setDoc(window.FB.doc(window.FB.db, "jogadores", p.docId), {
            name: p.name,
            photo: p.photo
        })
    ));
    const end = performance.now();
    return end - start;
}

async function run() {
    console.log("Running sequential baseline...");
    const seqTime = await benchmarkSequential();
    console.log(`Sequential: ${seqTime.toFixed(2)}ms`);

    console.log("Running parallel version...");
    const parTime = await benchmarkParallel();
    console.log(`Parallel: ${parTime.toFixed(2)}ms`);

    console.log(`Improvement: ${(seqTime / parTime).toFixed(2)}x faster`);
}

run();
