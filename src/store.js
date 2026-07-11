import { reactive, ref, computed } from 'vue';

export const state = reactive({
    autenticado: sessionStorage.getItem('app_machado_auth') === 'true',
    loggedInUser: parseInt(sessionStorage.getItem('app_machado_user') || '1', 10),
    phoneActiveTab: 'dashboard',
    showProfileModal: false,
    statsFilter: 'oficial',
    statsYearFilter: 'todos',
    historyFilter: 'todos',
    deferredPrompt: null,
    FOTO_PADRAO: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&q=80",

    players: [
        { id: 1, docId: "filho", name: "Gustavo Machado (Filho)", wins: 0, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
        { id: 2, docId: "pai", name: "Otávio Machado (Pai)", wins: 0, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" }
    ],
    matches: [],
    locaisLista: [],

    form: {
        id: null, tipo: 'oficial', localSelecionado: '', novoLocalNome: '', quadra: 'Saibro', tipoTerceiroSet: 'super',
        set1_j1: 0, set1_j2: 0, set2_j1: 0, set2_j2: 0, set3_j1: 0, set3_j2: 0,
        data: new Date().toISOString().split('T')[0]
    }
});

// Computed properties (can be exposed as functions or getters)
export const getters = {
    activePlayer: computed(() => {
        if (state.loggedInUser === 0) {
            return { id: 0, name: "Visitante (Visualizador)", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" };
        }
        return state.players.find(p => p.id === state.loggedInUser);
    }),

    isConfrontoEmpatado: computed(() => state.players[0]?.wins === state.players[1]?.wins),

    sortedMatches: computed(() => [...state.matches].sort((a, b) => new Date(b.data) - new Date(a.data))),

    dashboardMatches: computed(() => getters.sortedMatches.value.filter(m => m.tipo === 'oficial')),

    filteredHistoryMatches: computed(() => {
        if (state.historyFilter === 'todos') return getters.sortedMatches.value;
        return getters.sortedMatches.value.filter(m => m.tipo === state.historyFilter);
    }),

    currentKing: computed(() => state.players[0].wins >= state.players[1].wins ? state.players[0] : state.players[1]),

    currentLoser: computed(() => {
        if (state.players.length < 2) return null;
        return state.players[0].wins < state.players[1].wins ? state.players[0] : state.players[1];
    }),

    listaAnosDisponiveis: computed(() => {
        const anos = state.matches.map(m => {
            if(!m.data) return null;
            return m.data.split('-')[0];
        }).filter(Boolean);
        return [...new Set(anos)].sort((a, b) => b - a);
    }),

    filteredMatchesForStats: computed(() => {
        return state.matches.filter(m => {
            const matchesTipo = m.tipo === state.statsFilter;
            if (state.statsYearFilter === 'todos') {
                return matchesTipo;
            }
            const matchAno = m.data ? m.data.split('-')[0] : '';
            return matchesTipo && matchAno === state.statsYearFilter;
        });
    }),

    sequenciaAtual: computed(() => {
        const oficiaisFinalizadas = [...state.matches]
            .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
            .sort((a, b) => new Date(b.data) - new Date(a.data));

        if (oficiaisFinalizadas.length === 0) return { jogadorId: 0, total: 0 };

        const primeiroVencedor = oficiaisFinalizadas[0].vencedor_id;
        let contador = 0;

        for (let match of oficiaisFinalizadas) {
            if (match.vencedor_id === primeiroVencedor) {
                contador++;
            } else {
                break;
            }
        }
        return { jogadorId: primeiroVencedor, total: contador };
    }),

    maiorSequenciaHistorica: computed(() => {
        const oficiaisFinalizadasCr = [...state.matches]
            .filter(m => m.tipo === 'oficial' && m.status !== 'Incompleto')
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        if (oficiaisFinalizadasCr.length === 0) return { jogadorId: 0, total: 0 };

        let maxSeq = 0;
        let maxJogador = 0;
        let atualSeq = 0;
        let atualJogador = 0;

        oficiaisFinalizadasCr.forEach(m => {
            if (m.vencedor_id === atualJogador) {
                atualSeq++;
            } else {
                if (atualSeq > maxSeq) {
                    maxSeq = atualSeq;
                    maxJogador = atualJogador;
                }
                atualJogador = m.vencedor_id;
                atualSeq = 1;
            }
        });

        if (atualSeq > maxSeq) {
            maxSeq = atualSeq;
            maxJogador = atualJogador;
        }

        return { jogadorId: maxJogador, total: maxSeq };
    }),

    totaisClutch: computed(() => {
        let clutch = { terceiroSetFilho: 0, terceiroSetPai: 0, setsLongosFilho: 0, setsLongosPai: 0 };

        getters.filteredMatchesForStats.value.forEach(m => {
            const testSetLongo = (j1, j2) => (j1 === 7 && (j2 === 5 || j2 === 6));
            if (testSetLongo(m.set1_j1, m.set1_j2)) clutch.setsLongosFilho++;
            if (testSetLongo(m.set1_j2, m.set1_j1)) clutch.setsLongosPai++;
            if (testSetLongo(m.set2_j1, m.set2_j2)) clutch.setsLongosFilho++;
            if (testSetLongo(m.set2_j2, m.set2_j1)) clutch.setsLongosPai++;
            if (m.set3_j1 !== null && m.set3_j2 !== null && m.tipoTerceiroSet === 'normal' && testSetLongo(m.set3_j1, m.set3_j2)) clutch.setsLongosFilho++;
            if (m.set3_j1 !== null && m.set3_j2 !== null && m.tipoTerceiroSet === 'normal' && testSetLongo(m.set3_j2, m.set3_j1)) clutch.setsLongosPai++;

            if (m.status !== 'Incompleto' && m.set3_j1 !== null && m.set3_j2 !== null && (m.set3_j1 > 0 || m.set3_j2 > 0)) {
                if (m.vencedor_id === 1) clutch.terceiroSetFilho++;
                if (m.vencedor_id === 2) clutch.terceiroSetPai++;
            }
        });
        return clutch;
    }),

    vitoriasPorcentagem: computed(() => {
        const f = getters.filteredMatchesForStats.value.filter(m => m.vencedor_id !== 0 && m.status !== 'Incompleto');
        if(!f.length) return { j1: 0, j2: 0 };
        let j1 = f.filter(m => m.vencedor_id === 1).length;
        return { j1: Math.round((j1 / f.length) * 100), j2: Math.round(((f.length - j1) / f.length) * 100) };
    }),

    vitoriasSuperficie: computed(() => {
        let dados = {
            'Saibro': { filho: 0, pai: 0 },
            'Rápida': { filho: 0, pai: 0 },
            'Grama': { filho: 0, pai: 0 }
        };
        getters.filteredMatchesForStats.value.forEach(m => {
            if (m.status !== 'Incompleto' && m.quadra && dados[m.quadra]) {
                if (m.vencedor_id === 1) dados[m.quadra].filho++;
                if (m.vencedor_id === 2) dados[m.quadra].pai++;
            }
        });
        return dados;
    }),

    totaisAcumulados: computed(() => {
        let stats = { jogosFilho: 0, jogosPai: 0, setsFilho: 0, setsPai: 0, gamesFilho: 0, gamesPai: 0, pneusFilho: 0, pneusPai: 0, bicicletasFilho: 0, bicicletasPai: 0 };
        getters.filteredMatchesForStats.value.forEach(m => {
            stats.gamesFilho += (m.set1_j1 || 0) + (m.set2_j1 || 0) + (m.set3_j1 || 0);
            stats.gamesPai += (m.set1_j2 || 0) + (m.set2_j2 || 0) + (m.set3_j2 || 0);

            const checarDominancia = (j1, j2, jEspecial) => {
                if (j1 === 6 && j2 === 0) if(jEspecial === 1) stats.pneusFilho++; else stats.pneusPai++;
                if (j1 === 6 && j2 === 1) if(jEspecial === 1) stats.bicicletasFilho++; else stats.bicicletasPai++;
            };
            checarDominancia(m.set1_j1, m.set1_j2, 1); checarDominancia(m.set1_j2, m.set1_j1, 2);
            checarDominancia(m.set2_j1, m.set2_j2, 1); checarDominancia(m.set2_j2, m.set2_j1, 2);
            if (m.set3_j1 !== null && m.set3_j2 !== null && m.tipoTerceiroSet === 'normal') {
                checarDominancia(m.set3_j1, m.set3_j2, 1); checarDominancia(m.set3_j2, m.set3_j1, 2);
            }

            if ((m.set1_j1 || 0) > (m.set1_j2 || 0)) stats.setsFilho++; else if ((m.set1_j2 || 0) > (m.set1_j1 || 0)) stats.setsPai++;
            if ((m.set2_j1 || 0) > (m.set2_j2 || 0)) stats.setsFilho++; else if ((m.set2_j2 || 0) > (m.set2_j1 || 0)) stats.setsPai++;

            if (m.set3_j1 || m.set3_j2) {
                if ((m.set3_j1 || 0) > (m.set3_j2 || 0)) stats.setsFilho++; else if ((m.set3_j2 || 0) > (m.set3_j1 || 0)) stats.setsPai++;
            }

            if (m.status !== 'Incompleto') {
                if (m.vencedor_id === 1) stats.jogosFilho++;
                else if (m.vencedor_id === 2) stats.jogosPai++;
            }
        });
        return stats;
    }),

    filteredWinRate: computed(() => {
        const f = getters.filteredMatchesForStats.value.filter(m => m.vencedor_id !== 0 && m.status !== 'Incompleto');
        if(!f.length) return { j1: 0, j2: 0 };
        let j1 = f.filter(m => m.vencedor_id === 1).length;
        return { j1: Math.round((j1 / f.length) * 100), j2: Math.round(((f.length - j1) / f.length) * 100) };
    }),

    locaisEstatisticas: computed(() => {
        const est = {};
        state.locaisLista.forEach(l => est[l.nome] = { nome: l.nome, foto: l.foto || state.FOTO_PADRAO, total: 0, vitoriasFilho: 0, vitoriasPai: 0, derrotasFilho: 0, derrotasPai: 0 });
        getters.filteredMatchesForStats.value.forEach(m => {
            if (m.local && est[m.local]) {
                est[m.local].total++;
                if (m.status !== 'Incompleto') {
                    m.vencedor_id === 1 ? (est[m.local].vitoriasFilho++, est[m.local].derrotasPai++) : (est[m.local].vitoriasPai++, est[m.local].derrotasFilho++);
                }
            }
        });
        return Object.values(est).filter(e => e.total > 0).sort((a,b) => b.total - a.total);
    })
};

export const methods = {
    logout() {
        state.autenticado = false;
        state.showProfileModal = false;
        sessionStorage.removeItem('app_machado_auth');
        sessionStorage.removeItem('app_machado_user');
    },

    winRate(p) {
        const t = state.players[0].wins + state.players[1].wins;
        return t ? Math.round((p.wins / t) * 100) : 0;
    },

    formatScore(m) {
        let s = `${m.set1_j1}-${m.set1_j2}, ${m.set2_j1}-${m.set2_j2}`;
        if (m.set3_j1 !== null && m.set3_j2 !== null) s += `, ${m.set3_j1}-${m.set3_j2}`;
        return s;
    },

    getLocalPhoto(nome) {
        const l = state.locaisLista.find(l => l.nome.toLowerCase() === nome.toLowerCase());
        return l?.foto || state.FOTO_PADRAO;
    },

    calcularAproveitamentoLocal(estat) {
        let usr = state.loggedInUser === 2 ? 2 : 1;
        let v = usr === 1 ? estat.vitoriasFilho : estat.vitoriasPai;
        return estat.total ? Math.round((v / estat.total) * 100) : 0;
    },

    resetForm() {
        state.form = { id: null, tipo: 'oficial', localSelecionado: '', novoLocalNome: '', quadra: 'Saibro', tipoTerceiroSet: 'super', set1_j1: 0, set1_j2: 0, set2_j1: 0, set2_j2: 0, set3_j1: 0, set3_j2: 0, data: new Date().toISOString().split('T')[0] };
    },

    carregarParaEdicao(m) {
        if(state.loggedInUser === 0) return;
        state.form = {
            id: m.id, tipo: m.tipo, localSelecionado: m.local, novoLocalNome: '', quadra: m.quadra,
            tipoTerceiroSet: m.tipoTerceiroSet || 'super',
            set1_j1: m.set1_j1, set1_j2: m.set1_j2, set2_j1: m.set2_j1, set2_j2: m.set2_j2,
            set3_j1: m.set3_j1 || 0, set3_j2: m.set3_j2 || 0, data: m.data
        };
        state.phoneActiveTab = 'new-game';
    },

    calcularVitoriasDinamicas() {
        let f = 0, p = 0;
        state.matches.forEach(m => {
            if (m.tipo === 'oficial' && m.status !== 'Incompleto') {
                m.vencedor_id === 1 ? f++ : (m.vencedor_id === 2 ? p++ : 0);
            }
        });
        state.players[0].wins = f; state.players[1].wins = p;
    }
};
