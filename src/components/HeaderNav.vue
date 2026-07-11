<template>
  <header class="bg-tennis-brand text-white px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
      <div class="flex items-center gap-3">
          <div class="relative group" :class="state.loggedInUser !== 0 ? 'cursor-pointer' : ''" @click="state.loggedInUser !== 0 ? profileFileInput.click() : null">
              <img :src="activePlayer?.photo" class="w-10 h-10 rounded-full border-2 border-tennis-neon object-cover hover:opacity-85 transition">
              <div v-if="state.loggedInUser !== 0" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]">
                  <i class="fa-solid fa-camera text-white"></i>
              </div>
              <input v-if="state.loggedInUser !== 0" type="file" ref="profileFileInput" class="hidden" accept="image/*" @change="uploadProfilePhoto">
          </div>
          <div class="text-left">
              <p class="text-[9px] text-tennis-neon uppercase tracking-wider font-extrabold leading-none mb-0.5">
                  {{ state.loggedInUser === 0 ? 'Acesso Convidado' : 'Jogador Ativo' }}
              </p>
              <p class="text-sm font-bold leading-tight">{{ activePlayer?.name }}</p>
          </div>
      </div>

      <div class="flex items-center gap-2">
          <button v-if="state.deferredPrompt" @click="installPWA" class="text-xs bg-tennis-neon hover:bg-tennis-neon/80 px-2.5 py-1.5 rounded-lg text-tennis-dark font-extrabold flex items-center gap-1 transition animate-bounce">
              <i class="fa-solid fa-download"></i> Instalar App
          </button>
          <button v-if="state.loggedInUser !== 0" @click="state.showProfileModal = true" class="text-xs bg-tennis-accent hover:bg-tennis-accent/80 px-3 py-1.5 rounded-lg text-tennis-neon font-bold flex items-center gap-1 transition">
              <i class="fa-solid fa-sliders"></i> Configurações
          </button>
          <button v-else @click="methods.logout()" class="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white font-bold flex items-center gap-1 transition">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
          </button>
      </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { state, getters, methods } from '../store.js';
import { db, setDoc, doc } from '../firebase.js';
import imageCompression from 'browser-image-compression';

const profileFileInput = ref(null);
const activePlayer = getters.activePlayer;

const installPWA = async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    const { outcome } = await state.deferredPrompt.userChoice;
    if (outcome === 'accepted') state.deferredPrompt = null;
};

const comprimirEConverterImagem = async (file) => {
    const opcoes = { maxSizeMB: 0.15, maxWidthOrHeight: 600, useWebWorker: true, fileType: 'image/jpeg' };
    try {
        const arquivoComprimido = await imageCompression(file, opcoes);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(arquivoComprimido);
            reader.onloadend = () => resolve(reader.result);
        });
    } catch (error) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => resolve(e.target.result);
        });
    }
};

const uploadProfilePhoto = async (ev) => {
    if(state.loggedInUser === 0) return;
    const f = ev.target.files[0]; if (!f) return;
    const base64Comprimido = await comprimirEConverterImagem(f);
    try {
        await setDoc(doc(db, "jogadores", activePlayer.value.docId), { photo: base64Comprimido }, { merge: true });
        // Find player and update directly via reference to maintain reactivity
        const pIdx = state.players.findIndex(p => p.id === activePlayer.value.id);
        if (pIdx !== -1) {
            state.players[pIdx].photo = base64Comprimido;
        }
        alert("Foto de perfil atualizada!");
    } catch (err) {
        console.error(err);
        alert("Erro ao salvar foto de perfil.");
    }
};
</script>
