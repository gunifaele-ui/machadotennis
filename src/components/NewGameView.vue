<template>
  <div class="space-y-4 text-left">
      <h2 class="text-xl font-bold text-tennis-brand">{{ form.id ? 'Editar Partida' : 'Registrar Nova Partida' }}</h2>
      <div class="bg-white p-4 rounded-xl border border-tennis-border space-y-4 shadow-sm">
          <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Objetivo</label>
              <div class="grid grid-cols-2 gap-2">
                  <button v-for="t in ['oficial', 'treino']" :key="t" @click="form.tipo = t" :class="['py-2 px-2 rounded-lg text-xs font-semibold border capitalize transition', form.tipo === t ? 'bg-tennis-brand text-white border-tennis-brand' : 'bg-slate-50 text-slate-600 border-slate-200']">{{ t }}</button>
              </div>
          </div>
          <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Local / Clube</label>
              <select v-model="form.localSelecionado" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none mb-2">
                  <option value="">-- Selecione um local --</option>
                  <option v-for="loc in state.locaisLista" :key="loc.id" :value="loc.nome">{{ loc.nome }}</option>
                  <option value="novo">Novo Local</option>
              </select>
              <input v-if="form.localSelecionado === 'novo'" type="text" v-model="form.novoLocalNome" placeholder="Nome do novo clube/local" class="w-full bg-slate-50 border border-tennis-brand text-xs rounded-lg p-2.5">
          </div>
          <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Tipo de Quadra</label>
              <div class="grid grid-cols-3 gap-2">
                  <button v-for="surface in ['Saibro', 'Rápida', 'Grama']" :key="surface" @click="form.quadra = surface" :class="['py-2 rounded-lg text-xs font-semibold border transition', form.quadra === surface ? 'bg-tennis-brand text-white border-tennis-brand' : 'bg-slate-50 text-slate-600 border-slate-200']">{{ surface }}</button>
              </div>
          </div>

          <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Formato do 3º Set</label>
              <select v-model="form.tipoTerceiroSet" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 outline-none">
                  <option value="super">Super Tie-break (Até 10 pontos)</option>
                  <option value="normal">Set Normal (Até 6 games)</option>
              </select>
          </div>

          <div class="space-y-3 pt-2">
              <div class="text-[10px] font-bold text-slate-400 pb-1 border-b">GAMES (GUSTAVO VS OTÁVIO)</div>
              <div v-for="s in [1, 2, 3]" :key="s" class="flex justify-between items-center text-xs">
                  <span class="font-bold text-slate-600">
                      {{ s }}º Set <span v-if="s === 3" class="text-[10px] text-tennis-accent">({{ form.tipoTerceiroSet === 'super' ? 'Super Tie' : 'Normal' }})</span>
                  </span>
                  <div class="flex gap-2">
                      <input type="number" min="0" max="99" v-model.number="form['set'+s+'_j1']" @input="validarInputSet('set'+s+'_j1')" class="w-12 border text-center font-mono py-1 rounded">
                      <span>:</span>
                      <input type="number" min="0" max="99" v-model.number="form['set'+s+'_j2']" @input="validarInputSet('set'+s+'_j2')" class="w-12 border text-center font-mono py-1 rounded">
                  </div>
              </div>
          </div>
          <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Data</label>
              <input type="date" v-model="form.data" class="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 font-mono">
          </div>
      </div>
      <div class="flex gap-2">
          <button v-if="form.id" @click="methods.resetForm()" class="w-1/3 bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs uppercase">Cancelar</button>
          <button @click="registerMatch" :class="[form.id ? 'w-2/3' : 'w-full', 'bg-tennis-brand hover:bg-tennis-accent text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md']">Salvar Placar</button>
      </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state, methods } from '../store.js';
import { db, collection, addDoc, updateDoc, doc } from '../firebase.js';

// use local ref directly pointing to state property to prevent repetitive `state.`
const form = computed(() => state.form);

const validarInputSet = (campo) => {
    let val = parseInt(state.form[campo], 10);
    if (isNaN(val) || val < 0) state.form[campo] = 0;
    if (val > 99) state.form[campo] = 99;
};

const conferirSetNormalCompleto = (a, b) => {
    if ((a === 6 && b <= 4) || (b === 6 && a <= 4)) return true;
    if ((a === 7 && (b === 5 || b === 6)) || (b === 7 && (a === 5 || a === 6))) return true;
    return false;
};

const conferirSuperTieCompleto = (a, b) => {
    if (a >= 10 && (a - b) >= 2) return true;
    if (b >= 10 && (b - a) >= 2) return true;
    return false;
};

const registerMatch = async () => {
    if(state.loggedInUser === 0) return;
    let lf = state.form.localSelecionado;
    if (lf === 'novo') {
        lf = state.form.novoLocalNome.trim();
        if (!lf) return alert("Digite o nome do novo local!");
        const d = await addDoc(collection(db, "locais"), { nome: lf, foto: state.FOTO_PADRAO });
        state.locaisLista.push({ id: d.id, nome: lf, foto: state.FOTO_PADRAO });
    }
    if (!lf) return alert("Selecione um local.");

    let s1G = state.form.set1_j1, s1O = state.form.set1_j2;
    let s2G = state.form.set2_j1, s2O = state.form.set2_j2;
    let s3G = state.form.set3_j1, s3O = state.form.set3_j2;

    let jogoCompleto = true;
    if (!conferirSetNormalCompleto(s1G, s1O)) jogoCompleto = false;
    if (!conferirSetNormalCompleto(s2G, s2O)) jogoCompleto = false;

    let parcialG = (s1G > s1O ? 1:0) + (s2G > s2O ? 1:0);
    let parcialO = (s1O > s1G ? 1:0) + (s2O > s2G ? 1:0);

    let exigeTerceiroSet = (parcialG === 1 && parcialO === 1);
    let temDadosNoTerceiroSet = (s3G > 0 || s3O > 0);

    if (exigeTerceiroSet || temDadosNoTerceiroSet) {
        if (state.form.tipoTerceiroSet === 'super') {
            if (!conferirSuperTieCompleto(s3G, s3O)) jogoCompleto = false;
        } else {
            if (!conferirSetNormalCompleto(s3G, s3O)) jogoCompleto = false;
        }
    }

    let setsG = (s1G > s1O ? 1:0) + (s2G > s2O ? 1:0) + (s3G > s3O ? 1:0);
    let setsO = (s1O > s1G ? 1:0) + (s2O > s2G ? 1:0) + (s3O > s3G ? 1:0);
    let vencedor_id = setsG > setsO ? 1 : 2;

    if (!jogoCompleto && setsG === setsO) {
        vencedor_id = (s1G+s2G+s3G) >= (s1O+s2O+s3O) ? 1 : 2;
    }

    const matchData = {
        data: state.form.data, local: lf, quadra: state.form.quadra, tipo: state.form.tipo,
        tipoTerceiroSet: state.form.tipoTerceiroSet,
        status: jogoCompleto ? "Finalizado" : "Incompleto",
        vencedor_id: vencedor_id,
        set1_j1: s1G, set1_j2: s1O, set2_j1: s2G, set2_j2: s2O,
        set3_j1: (s3G || s3O) ? s3G : null, set3_j2: (s3G || s3O) ? s3O : null
    };

    try {
        if (state.form.id) {
            await updateDoc(doc(db, "partidas", state.form.id), matchData);
            const idx = state.matches.findIndex(m => m.id === state.form.id);
            if(idx !== -1) state.matches[idx] = { id: state.form.id, ...matchData };
        } else {
            const dRef = await addDoc(collection(db, "partidas"), matchData);
            state.matches.push({ id: dRef.id, ...matchData });
        }
        methods.calcularVitoriasDinamicas();
        methods.resetForm();
        state.phoneActiveTab = 'dashboard';
    } catch(e) {
        console.error(e);
        alert("Erro ao salvar a partida.");
    }
};
</script>
