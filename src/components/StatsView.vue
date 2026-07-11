<template>
  <div class="space-y-6 text-left">
      <div class="flex justify-between items-center">
          <div>
              <h2 class="text-xl font-bold text-tennis-brand">Estatísticas Head-to-Head</h2>
              <p class="text-xs text-slate-500">Dados acumulados em tempo real.</p>
          </div>
          <!-- Botão PDF integrado de forma limpa -->
          <button @click="exportarParaPDF" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow">
              <i class="fa-solid fa-file-pdf"></i> Exportar PDF
          </button>
      </div>

      <div class="bg-white p-1.5 rounded-xl border border-tennis-border flex gap-1">
          <button v-for="t in ['oficial', 'treino']" :key="t" @click="setStatsFilter(t)" :class="['flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition', state.statsFilter === t ? 'bg-tennis-brand text-white' : 'text-slate-500']">Partidas {{ t }}s</button>
      </div>

      <div class="space-y-1">
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Filtrar por Ano</label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              <button @click="setStatsYearFilter('todos')" :class="['px-3 py-1.5 text-xs rounded-lg font-medium border transition shrink-0 snap-start', state.statsYearFilter === 'todos' ? 'bg-tennis-accent text-white border-tennis-accent' : 'bg-white text-slate-600 border-tennis-border']">Todos</button>
              <button v-for="ano in getters.listaAnosDisponiveis.value" :key="ano" @click="setStatsYearFilter(ano)" :class="['px-4 py-1.5 text-xs rounded-lg font-mono font-medium border transition shrink-0 snap-start', state.statsYearFilter === ano ? 'bg-tennis-accent text-white border-tennis-accent' : 'bg-white text-slate-600 border-tennis-border']">{{ ano }}</button>
          </div>
      </div>

      <!-- Evolução Temporal (Gráfico de Linha Otimizado) -->
      <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
          <div class="flex items-center gap-1.5 mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Evolução Temporal do Confronto</h3>
              <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
                  <i class="fa-solid fa-circle-info text-[11px]"></i>
                  <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
                      <strong>Evolução Temporal:</strong> Exibe o acúmulo de vitórias ao longo do tempo. As linhas estão mais leves e sem bolinhas sobrepostas para facilitar a leitura em históricos longos.
                  </span>
              </div>
          </div>
          <div class="relative w-full h-48">
              <canvas id="chartEvolucao"></canvas>
          </div>
      </div>

      <!-- Grid de Totais com Porcentagem Acoplada -->
      <div class="grid grid-cols-3 gap-2">
          <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
              <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Jogos Ganhos</h4>
              <div>
                  <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.jogosFilho }} <span class="text-[10px] font-sans text-slate-400 font-normal">({{ vitoriasPorcentagem.j1 }}%)</span></span></p>
                  <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.jogosPai }} <span class="text-[10px] font-sans text-slate-400 font-normal">({{ vitoriasPorcentagem.j2 }}%)</span></span></p>
              </div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
              <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Sets Vencidos</h4>
              <div>
                  <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.setsFilho }}</span></p>
                  <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.setsPai }}</span></p>
              </div>
          </div>
          <div class="bg-white p-3 rounded-xl border border-tennis-border shadow-sm flex flex-col justify-between">
              <h4 class="text-[9px] font-bold uppercase text-slate-400 mb-1 leading-tight">Games Vencidos</h4>
              <div>
                  <p class="text-[11px] font-bold text-tennis-brand">G: <span class="font-mono text-sm text-tennis-accent">{{ totaisAcumulados.gamesFilho }}</span></p>
                  <p class="text-[11px] font-bold text-slate-700 mt-0.5">O: <span class="font-mono text-sm text-amber-600">{{ totaisAcumulados.gamesPai }}</span></p>
              </div>
          </div>
      </div>

      <!-- Vitórias por Tipo de Quadra (Superfície) -->
      <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
          <div class="flex items-center gap-1.5 mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Vitórias por Tipo de Quadra</h3>
              <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
                  <i class="fa-solid fa-circle-info text-[11px]"></i>
                  <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
                      <strong>Superfícies:</strong> Registra as vitórias de cada jogador de acordo com o piso da quadra (Saibro, Rápida ou Grama) no período selecionado.
                  </span>
              </div>
          </div>
          <div class="space-y-2 text-xs">
              <div v-for="sup in ['Saibro', 'Rápida', 'Grama']" :key="sup" class="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span class="font-bold text-slate-700 flex items-center gap-1.5">
                      <i class="fa-solid fa-circle text-[8px]" :class="sup==='Saibro'?'text-orange-600':(sup==='Rápida'?'text-blue-500':'text-emerald-500')"></i>
                      Quadra de {{ sup }}
                  </span>
                  <div class="flex gap-4 font-semibold">
                      <span class="text-tennis-brand">Gustavo: <span class="font-mono font-bold text-tennis-accent">{{ vitoriasSuperficie[sup].filho }}</span></span>
                      <span class="text-amber-600">Otávio: <span class="font-mono font-bold text-amber-600">{{ vitoriasSuperficie[sup].pai }}</span></span>
                  </div>
              </div>
          </div>
      </div>

      <!-- Fator Psicológico / Clutch Factor -->
      <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
          <div class="flex items-center gap-1.5 mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Desempenho sob Pressão (Clutch Factor)</h3>
              <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
                  <i class="fa-solid fa-circle-info text-[11px]"></i>
                  <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
                      <strong>Clutch Factor:</strong> Avalia o lado mental. O "3º Set Decisivo" mostra quem ganha as partidas que vão para o desempate. "Sets Longos" mostra o aproveitamento em sets disputados no limite (7-5 ou tie-breaks).
                  </span>
              </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p class="font-semibold text-slate-500 text-[10px] uppercase mb-1.5">3º Set Decisivo (Negra)</p>
                  <p class="text-tennis-brand font-bold">Gustavo: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.terceiroSetFilho }} vits</span></p>
                  <p class="text-amber-600 font-bold mt-0.5">Otávio: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.terceiroSetPai }} vits</span></p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p class="font-semibold text-slate-500 text-[10px] uppercase mb-1.5">Sets Longos (7-5 / Tie)</p>
                  <p class="text-tennis-brand font-bold">Gustavo: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.setsLongosFilho }} vits</span></p>
                  <p class="text-amber-600 font-bold mt-0.5">Otávio: <span class="font-mono font-medium text-slate-700">{{ totaisClutch.setsLongosPai }} vits</span></p>
              </div>
          </div>
      </div>

      <!-- Pneus e Bicicletas -->
      <div class="bg-white p-4 rounded-xl border border-tennis-border shadow-sm">
          <div class="flex items-center gap-1.5 mb-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Placares Dominantes (Pneus & Bicicletas)</h3>
              <div class="tooltip relative inline-block cursor-pointer text-slate-400 hover:text-tennis-accent">
                  <i class="fa-solid fa-circle-info text-[11px]"></i>
                  <span class="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl font-normal leading-relaxed z-50">
                      <strong>Pneus e Bicicletas:</strong> Registra as vitórias mais avassaladoras de sets. Um set ganho por 6-0 é classificado como "Pneu" (Bagel) e um set ganho por 6-1 como "Bicicleta" (Breadstick).
                  </span>
              </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p class="font-bold text-tennis-brand border-b pb-1 mb-1.5">Gustavo Machado</p>
                  <p class="text-slate-600">Pneus aplicados: <span class="font-mono font-bold text-tennis-accent">{{ totaisAcumulados.pneusFilho }}</span></p>
                  <p class="text-slate-600 mt-0.5">Bicicletas: <span class="font-mono font-bold text-tennis-accent">{{ totaisAcumulados.bicicletasFilho }}</span></p>
              </div>
              <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p class="font-bold text-amber-600 border-b pb-1 mb-1.5">Otávio Machado</p>
                  <p class="text-slate-600">Pneus aplicados: <span class="font-mono font-bold text-amber-600">{{ totaisAcumulados.pneusPai }}</span></p>
                  <p class="text-slate-600 mt-0.5">Bicicletas: <span class="font-mono font-bold text-amber-600">{{ totaisAcumulados.bicicletasPai }}</span></p>
              </div>
          </div>
      </div>

      <!-- Desempenho por Clube (Ajustado com nomes fixos) -->
      <div class="space-y-3">
          <h3 class="text-xs font-bold uppercase text-tennis-brand tracking-wider flex items-center gap-1"><i class="fa-solid fa-map-location-dot"></i> Desempenho por Clube</h3>
          <div v-if="locaisEstatisticas.length === 0" class="text-center text-xs text-slate-400 py-6 bg-white rounded-xl border border-dashed">Sem dados disponíveis para este período.</div>
          <div v-for="estat in locaisEstatisticas" :key="estat.nome" class="bg-white border border-tennis-border rounded-xl p-3 flex gap-3 items-center shadow-sm">
              <img :src="estat.foto" class="w-16 h-16 rounded-lg object-cover shadow-sm">
              <div class="flex-grow min-w-0 text-xs text-slate-500 font-medium grid grid-cols-2 gap-y-0.5">
                  <h4 class="text-sm font-bold text-slate-800 col-span-2 truncate">{{ estat.nome }}</h4>
                  <p>Jogos: <span class="font-mono text-slate-700 font-bold">{{ !estat.total ? 0 : estat.total }}</span></p>
                  <p>Aproveitamento: <span class="font-mono text-tennis-accent font-bold">{{ methods.calcularAproveitamentoLocal(estat) }}%</span></p>
                  <!-- Exibição fixa para que qualquer convidado saiba quem ganhou -->
                  <p>Gustavo ganhou: <span class="font-mono text-emerald-600 font-bold">{{ estat.vitoriasFilho }}</span></p>
                  <p>Otávio ganhou: <span class="font-mono text-amber-600 font-bold">{{ estat.vitoriasPai }}</span></p>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue';
import { state, getters, methods } from '../store.js';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const totaisAcumulados = getters.totaisAcumulados;
const vitoriasPorcentagem = getters.vitoriasPorcentagem;
const vitoriasSuperficie = getters.vitoriasSuperficie;
const totaisClutch = getters.totaisClutch;
const locaisEstatisticas = getters.locaisEstatisticas;

let instaciaGrafico = null;

const setStatsFilter = async (t) => {
    state.statsFilter = t;
    await nextTick();
    atualizarGrafico();
};

const setStatsYearFilter = async (y) => {
    state.statsYearFilter = y;
    await nextTick();
    atualizarGrafico();
};

const atualizarGrafico = () => {
    const ctx = document.getElementById('chartEvolucao');
    if (!ctx) return;

    const partidasCronologicas = [...getters.filteredMatchesForStats.value]
        .filter(m => m.status !== 'Incompleto')
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    let acumuladoFilho = 0;
    let acumuladoPai = 0;

    const labels = ['Início'];
    const dataFilho = [0];
    const dataPai = [0];

    partidasCronologicas.forEach((m, index) => {
        if (m.vencedor_id === 1) acumuladoFilho++;
        if (m.vencedor_id === 2) acumuladoPai++;

        labels.push(m.data || `J${index+1}`);
        dataFilho.push(acumuladoFilho);
        dataPai.push(acumuladoPai);
    });

    if (instaciaGrafico) instaciaGrafico.destroy();

    instaciaGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Gustavo',
                    data: dataFilho,
                    borderColor: '#306c42',
                    backgroundColor: 'rgba(48, 108, 66, 0.05)',
                    fill: true,
                    tension: 0.15,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Otávio',
                    data: dataPai,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    fill: true,
                    tension: 0.15,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { family: 'Poppins', size: 10 } } } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'JetBrains Mono', size: 8 } } },
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'JetBrains Mono', size: 9 }, stepSize: 1 } }
            }
        }
    });
};

const exportarParaPDF = () => {
    const doc = new jsPDF();

    // Título Superior Estilizado
    doc.setFillColor(19, 48, 28);
    doc.rect(0, 0, 220, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("MACHADO'S GRAND SLAM - RELATÓRIO", 14, 16);

    // Subtítulo de Metadados do filtro
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Filtro Atual: Partidas ${state.statsFilter}s | Ano: ${state.statsYearFilter}`, 14, 33);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 38);

    // Bloco de Dados Acumulados Gerais
    doc.setFillColor(244, 247, 244);
    doc.rect(14, 44, 182, 32, 'F');

    doc.setTextColor(19, 48, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("RESUMO DOS CONTADORES ACUMULADOS", 18, 51);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Gustavo Machado: ${totaisAcumulados.value.jogosFilho} Vitórias (${vitoriasPorcentagem.value.j1}%) | Sets: ${totaisAcumulados.value.setsFilho} | Games: ${totaisAcumulados.value.gamesFilho}`, 18, 59);
    doc.text(`Otávio Machado: ${totaisAcumulados.value.jogosPai} Vitórias (${vitoriasPorcentagem.value.j2}%) | Sets: ${totaisAcumulados.value.setsPai} | Games: ${totaisAcumulados.value.gamesPai}`, 18, 65);
    doc.text(`Placares Extremos (Pneus): Gustavo ${totaisAcumulados.value.pneusFilho} x ${totaisAcumulados.value.pneusPai} Otávio`, 18, 71);

    // Tabela de Histórico de Jogos Filtrados
    doc.setTextColor(19, 48, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("CONFRONTOS DETALHADOS NO PERÍODO", 14, 86);

    const cabecalhosTabela = [["Data", "Local", "Superfície", "Tipo", "Vencedor", "Placar"]];
    const linhasTabela = getters.filteredMatchesForStats.value.map(m => [
        m.data || '',
        m.local || '',
        m.quadra || '',
        m.tipo || '',
        m.status === 'Incompleto' ? 'Em Aberto' : (m.vencedor_id === 1 ? 'Gustavo' : 'Otávio'),
        methods.formatScore(m)
    ]);

    doc.autoTable({
        startY: 92,
        head: cabecalhosTabela,
        body: linhasTabela,
        headStyles: { fillColor: [19, 48, 28], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 2.5 },
        theme: 'striped'
    });

    doc.save(`grand-slam-relatorio-${state.statsFilter}-${state.statsYearFilter}.pdf`);
};

// Global event listener setup to trigger chart reload (from App.vue navigation)
const updateChartHandler = () => {
    nextTick(() => { atualizarGrafico(); });
};

onMounted(() => {
    atualizarGrafico();
    window.addEventListener('update-chart', updateChartHandler);
});

onUnmounted(() => {
    window.removeEventListener('update-chart', updateChartHandler);
    if(instaciaGrafico) instaciaGrafico.destroy();
});
</script>
