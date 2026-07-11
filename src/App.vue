<template>
  <div class="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl md:max-w-2xl lg:max-w-4xl select-none text-slate-800 font-sans antialiased">

    <LoginScreen v-if="!state.autenticado" />

    <template v-if="state.autenticado">
      <HeaderNav />

      <main class="flex-grow p-4 pb-24 overflow-y-auto">
        <DashboardView v-if="state.phoneActiveTab === 'dashboard'" />
        <NewGameView v-if="state.phoneActiveTab === 'new-game'" />
        <StatsView v-if="state.phoneActiveTab === 'stats'" />
        <HistoryView v-if="state.phoneActiveTab === 'history'" />
      </main>

      <nav class="bg-white border-t border-tennis-border fixed bottom-0 left-0 right-0 py-2.5 flex justify-around items-center shadow-lg z-40 max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
        <template v-for="tab in [{id:'dashboard', icon:'chart-simple', label:'Dashboard'}, {id:'new-game', icon:'circle-plus', label:'Novo Jogo'}, {id:'stats', icon:'ranking-star', label:'Estatísticas'}, {id:'history', icon:'list-check', label:'Histórico'}]" :key="tab.id">
            <button v-if="tab.id !== 'new-game' || state.loggedInUser !== 0"
                    @click="setTab(tab.id)"
                    :class="['flex flex-col items-center gap-1 text-[10px]', state.phoneActiveTab === tab.id ? 'text-tennis-brand font-bold' : 'text-slate-400']">
                <i :class="'fa-solid fa-'+tab.icon+' text-lg'"></i>{{ tab.label }}
            </button>
        </template>
      </nav>

      <SettingsModal v-if="state.showProfileModal && state.loggedInUser !== 0" />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { state, methods } from './store.js';
import { db, collection, getDocs, setDoc, doc } from './firebase.js';

import LoginScreen from './components/LoginScreen.vue';
import HeaderNav from './components/HeaderNav.vue';
import DashboardView from './components/DashboardView.vue';
import NewGameView from './components/NewGameView.vue';
import StatsView from './components/StatsView.vue';
import HistoryView from './components/HistoryView.vue';
import SettingsModal from './components/SettingsModal.vue';

const setTab = (tabId) => {
    state.phoneActiveTab = tabId;
    if (tabId === 'stats') {
        // Event bus or global method call to update chart can go here
        window.dispatchEvent(new Event('update-chart'));
    }
};

const carregarDadosDoBanco = async () => {
    try {
        const qPlayers = await getDocs(collection(db, "jogadores"));

        if (qPlayers.empty) {
            for (const p of state.players) {
                await setDoc(doc(db, "jogadores", p.docId), {
                    name: p.name,
                    photo: p.photo
                });
            }
        } else {
            qPlayers.forEach(docSnap => {
                const pIdx = state.players.findIndex(p => p.docId === docSnap.id);
                if(pIdx !== -1 && docSnap.data().photo) state.players[pIdx].photo = docSnap.data().photo;
            });
        }

        const qLocais = await getDocs(collection(db, "locais"));
        state.locaisLista = qLocais.docs.map(d => ({ id: d.id, ...d.data() }));

        const qMatches = await getDocs(collection(db, "partidas"));
        state.matches = qMatches.docs.map(d => ({ id: d.id, ...d.data() }));
        methods.calcularVitoriasDinamicas();
    } catch (error) {
        console.error(error);
    }
};

const inicializarPWA = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        state.deferredPrompt = e;
    });
    window.addEventListener('appinstalled', () => {
        state.deferredPrompt = null;
    });
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log(err));
    }
};

onMounted(() => {
    if (state.autenticado) {
        carregarDadosDoBanco();
    }
    // Listen for custom login event from LoginScreen
    window.addEventListener('user-logged-in', () => {
        carregarDadosDoBanco();
    });

    inicializarPWA();
});
</script>

<style>
/* Global resets for the app container can stay here or in style.css */
</style>
