/* ============================================================
   ORBIS SENTINEL — relatorios.js
   Web Development (WD) · Global Solution 2026 · FIAP
   ============================================================
   IDs do HTML que este arquivo controla:
     #clock                → relógio BOM
     #last-sync            → timestamp de sync
     #rel-periodo          → select — período do relatório
     #rel-nivel            → select — filtro de nível
     #rel-regiao           → input texto — filtro de região
     #rel-obs              → textarea — observações do analista
     #error-regiao         → feedback de validação
     #error-rel            → erro geral do formulário
     #btn-gerar            → evento click — gera relatório
     #relatorio-preview    → DOM — exibe preview gerado
     #preview-title        → título do preview
     #preview-body         → conteúdo <pre> do relatório
     #btn-fechar-preview   → evento click — fecha preview
     #historico-lista      → DOM — lista de relatórios anteriores
     #nav-toggle / .sidebar → sidebar mobile
     #toast / #toast-message → notificações
   ============================================================ */

'use strict';

/* ── 1. DATASET ─────────────────────────────────────────────── */
const REGIOES = [
  { regiao: 'Cerrado_TO_Setor_Norte',      bioma: 'Cerrado',       nivel: 'CRITICO', focos: 31, ndvi: 0.16, umidade: 7.0,  tendencia: 'CRESCENTE'  },
  { regiao: 'Cerrado_MT_Setor_Leste',      bioma: 'Cerrado',       nivel: 'CRITICO', focos: 23, ndvi: 0.18, umidade: 8.5,  tendencia: 'CRESCENTE'  },
  { regiao: 'Amazonia_AM_Setor_Norte',     bioma: 'Amazonia',      nivel: 'CRITICO', focos: 18, ndvi: 0.21, umidade: 11.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Caatinga_BA_Setor_Central',   bioma: 'Caatinga',      nivel: 'ALERTA',  focos: 9,  ndvi: 0.29, umidade: 22.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Pantanal_MS_Setor_Oeste',     bioma: 'Pantanal',      nivel: 'ALERTA',  focos: 7,  ndvi: 0.35, umidade: 29.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Cerrado_GO_Setor_Sul',        bioma: 'Cerrado',       nivel: 'ATENCAO', focos: 3,  ndvi: 0.44, umidade: 38.0, tendencia: 'ESTAVEL'    },
  { regiao: 'MataAtlantica_SP_Setor_Vale', bioma: 'MataAtlantica', nivel: 'ATENCAO', focos: 2,  ndvi: 0.49, umidade: 43.0, tendencia: 'ESTAVEL'    },
  { regiao: 'Pampa_RS_Setor_Sul',          bioma: 'Pampa',         nivel: 'NORMAL',  focos: 0,  ndvi: 0.72, umidade: 61.0, tendencia: 'ESTAVEL'    },
  { regiao: 'Amazonia_PA_Setor_Leste',     bioma: 'Amazonia',      nivel: 'NORMAL',  focos: 0,  ndvi: 0.81, umidade: 74.0, tendencia: 'ESTAVEL'    },
];

// Histórico de relatórios pré-existentes
const HISTORICO_INICIAL = [
  { id: 'REL-006', periodo: 'Ciclo 08:00 UTC', nivel: 'CRITICO', regioes: 9,  alertas: 5, gerado: '08:00' },
  { id: 'REL-005', periodo: 'Ciclo 07:30 UTC', nivel: 'CRITICO', regioes: 9,  alertas: 4, gerado: '07:30' },
  { id: 'REL-004', periodo: 'Ciclo 07:00 UTC', nivel: 'ALERTA',  regioes: 9,  alertas: 3, gerado: '07:00' },
  { id: 'REL-003', periodo: 'Últimas 24h',      nivel: 'CRITICO', regioes: 9,  alertas: 5, gerado: '06:30' },
  { id: 'REL-002', periodo: 'Últimos 7 dias',   nivel: 'ALERTA',  regioes: 9,  alertas: 4, gerado: '06:00' },
  { id: 'REL-001', periodo: 'Últimos 30 dias',  nivel: 'CRITICO', regioes: 9,  alertas: 5, gerado: '05:30' },
];

/* ── 2. ESTADO ──────────────────────────────────────────────── */
let historico     = [...HISTORICO_INICIAL];
let relatorioIdx  = 7; // próximo ID
let sidebarAberta = false;
let toastTimer    = null;

/* ── 3. SELETORES ───────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);

const DOM = {
  clock:           $('#clock'),
  lastSync:        $('#last-sync'),
  relPeriodo:      $('#rel-periodo'),
  relNivel:        $('#rel-nivel'),
  relRegiao:       $('#rel-regiao'),
  relObs:          $('#rel-obs'),
  errorRegiao:     $('#error-regiao'),
  errorRel:        $('#error-rel'),
  btnGerar:        $('#btn-gerar'),
  preview:         $('#relatorio-preview'),
  previewTitle:    $('#preview-title'),
  previewBody:     $('#preview-body'),
  btnFecharPrev:   $('#btn-fechar-preview'),
  historicoLista:  $('#historico-lista'),
  navToggle:       $('#nav-toggle'),
  sidebar:         $('.sidebar'),
  toast:           $('#toast'),
  toastMsg:        $('#toast-message'),
};

/* ── 4. UTILITÁRIOS ─────────────────────────────────────────── */
function classeNivel(n) {
  return { CRITICO: 'critico', ALERTA: 'alerta', ATENCAO: 'atencao', NORMAL: 'normal' }[n] || 'normal';
}
function textoNivel(n) {
  return { CRITICO: 'CRÍTICO', ALERTA: 'ALERTA', ATENCAO: 'ATENÇÃO', NORMAL: 'NORMAL' }[n] || n;
}
function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function dataHoraAtual() {
  const d = new Date();
  return d.toLocaleString('pt-BR', { timeZone: 'UTC' }) + ' UTC';
}
function linha(char = '=', n = 60) { return char.repeat(n); }

/* ── 5. RELÓGIO (BOM — setInterval) ────────────────────────── */
function iniciarRelogio() {
  function tick() {
    const d = new Date();
    const str = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':');
    DOM.clock.textContent = str;
    DOM.clock.setAttribute('datetime', d.toISOString());
  }
  tick();
  setInterval(tick, 1000);
}

/* ── 6. GERAÇÃO DO RELATÓRIO ────────────────────────────────── */

/** Filtra regiões com base nas opções selecionadas */
function filtrarRegioes(periodo, nivel, regiaoFiltro) {
  let lista = [...REGIOES];

  // Filtro de nível
  if (nivel === 'CRITICO') {
    lista = lista.filter(r => r.nivel === 'CRITICO');
  } else if (nivel === 'ALERTA') {
    lista = lista.filter(r => r.nivel === 'CRITICO' || r.nivel === 'ALERTA');
  }

  // Filtro de região (texto parcial, case-insensitive)
  if (regiaoFiltro.trim()) {
    lista = lista.filter(r =>
      r.regiao.toLowerCase().includes(regiaoFiltro.trim().toLowerCase())
    );
  }

  return lista;
}

/** Monta o texto completo do relatório (espelha saída do gerar_relatorio() Python) */
function montarTextoRelatorio(lista, periodo, obs, id) {
  const agora = dataHoraAtual();
  const totalFocos = lista.reduce((s, r) => s + r.focos, 0);
  const cont = { CRITICO: 0, ALERTA: 0, ATENCAO: 0, NORMAL: 0 };
  lista.forEach(r => cont[r.nivel]++);

  const periodosLabel = {
    '24h': 'Últimas 24 horas', '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',  'ciclo': 'Ciclo atual'
  };

  let txt = '';
  txt += linha('=') + '\n';
  txt += `  ORBIS SENTINEL — RELATÓRIO ANALÍTICO\n`;
  txt += `  ID: ${id}   |   Gerado: ${agora}\n`;
  txt += `  Período: ${periodosLabel[periodo] || periodo}\n`;
  txt += linha('=') + '\n\n';

  txt += `  RESUMO ESTATÍSTICO\n`;
  txt += linha('-') + '\n';
  txt += `  Regiões analisadas  : ${lista.length}\n`;
  txt += `  Total de focos      : ${totalFocos}\n`;
  txt += `  [!!!] CRÍTICO       : ${cont.CRITICO} região(ões)\n`;
  txt += `  [!! ] ALERTA        : ${cont.ALERTA} região(ões)\n`;
  txt += `  [ ! ] ATENÇÃO       : ${cont.ATENCAO} região(ões)\n`;
  txt += `  [ OK] NORMAL        : ${cont.NORMAL} região(ões)\n\n`;

  txt += `  DETALHAMENTO\n`;
  txt += linha('-') + '\n';
  lista.forEach(r => {
    const icon = { CRITICO:'[!!!]', ALERTA:'[!! ]', ATENCAO:'[ ! ]', NORMAL:'[ OK]' }[r.nivel];
    txt += `  ${icon} ${r.nivel.padEnd(7)} ${r.regiao.padEnd(35)} `;
    txt += `Focos:${String(r.focos).padStart(3)}  NDVI:${r.ndvi.toFixed(2)}  Umid:${String(r.umidade).padStart(5)}%  ${r.tendencia}\n`;
  });

  if (obs.trim()) {
    txt += `\n  OBSERVAÇÕES DO ANALISTA\n`;
    txt += linha('-') + '\n';
    txt += `  ${obs.trim()}\n`;
  }

  txt += `\n` + linha('=') + '\n';
  txt += `  FIM DO RELATÓRIO — Orbis Sentinel 2026\n`;
  txt += linha('=') + '\n';

  return txt;
}

/* ── 7. VALIDAÇÃO DO FORMULÁRIO ─────────────────────────────── */
function limparErros() {
  DOM.errorRegiao.textContent = '';
  DOM.errorRel.textContent    = '';
  DOM.relRegiao.classList.remove('form-input--error');
}

function validarFormulario() {
  limparErros();
  const regiaoFiltro = DOM.relRegiao.value.trim();
  let valido = true;

  // Verifica se o filtro de região bate com alguma região conhecida (se preenchido)
  if (regiaoFiltro) {
    const match = REGIOES.some(r =>
      r.regiao.toLowerCase().includes(regiaoFiltro.toLowerCase())
    );
    if (!match) {
      DOM.errorRegiao.textContent = `Nenhuma região encontrada para "${regiaoFiltro}". Deixe em branco para todas.`;
      DOM.relRegiao.classList.add('form-input--error');
      DOM.relRegiao.focus();
      valido = false;
    }
  }

  return valido;
}

/* ── 8. GERAR RELATÓRIO (Evento click — btn-gerar) ──────────── */
function iniciarGerador() {
  DOM.btnGerar.addEventListener('click', () => {
    if (!validarFormulario()) return;

    const periodo      = DOM.relPeriodo.value;
    const nivel        = DOM.relNivel.value;
    const regiaoFiltro = DOM.relRegiao.value;
    const obs          = DOM.relObs.value;

    const lista = filtrarRegioes(periodo, nivel, regiaoFiltro);

    if (lista.length === 0) {
      DOM.errorRel.textContent = 'Nenhuma região corresponde aos filtros selecionados. Ajuste e tente novamente.';
      return;
    }

    const id  = `REL-${String(relatorioIdx).padStart(3, '0')}`;
    const txt = montarTextoRelatorio(lista, periodo, obs, id);

    // Exibe preview no DOM
    const periodosLabel = {
      '24h': 'Últimas 24h', '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias', 'ciclo': 'Ciclo Atual'
    };
    DOM.previewTitle.textContent = `Relatório ${id} — ${periodosLabel[periodo]}`;
    DOM.previewBody.textContent  = txt;
    DOM.preview.removeAttribute('hidden');
    DOM.preview.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Adiciona ao histórico
    const piorNivel = lista[0]?.nivel || 'NORMAL';
    historico.unshift({
      id, periodo: periodosLabel[periodo],
      nivel: piorNivel, regioes: lista.length,
      alertas: lista.filter(r => r.nivel === 'CRITICO' || r.nivel === 'ALERTA').length,
      gerado: horaAtual()
    });
    relatorioIdx++;
    renderizarHistorico();

    mostrarToast(`✓ Relatório ${id} gerado com sucesso.`);
    DOM.relObs.value = '';
    DOM.relRegiao.value = '';
  });

  // Fechar preview
  DOM.btnFecharPrev.addEventListener('click', () => {
    DOM.preview.setAttribute('hidden', '');
  });

  // Enter no campo região também dispara geração
  DOM.relRegiao.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') DOM.btnGerar.click();
  });
}

/* ── 9. HISTÓRICO DE RELATÓRIOS ─────────────────────────────── */
function renderizarHistorico() {
  DOM.historicoLista.innerHTML = '';

  historico.slice(0, 10).forEach((rel, i) => {
    const li = document.createElement('li');
    li.className = 'alert-card alert-card--alerta';
    li.style.borderLeftColor = rel.nivel === 'CRITICO'
      ? 'var(--critico-main)' : 'var(--alerta-main)';
    li.style.animationDelay = `${i * 50}ms`;
    li.setAttribute('role', 'listitem');
    li.innerHTML = `
      <div class="alert-card__level"
        style="background:${rel.nivel === 'CRITICO' ? 'var(--critico-bg)' : 'var(--alerta-bg)'};
               color:${rel.nivel === 'CRITICO' ? 'var(--critico-main)' : 'var(--alerta-main)'};
               border-color:${rel.nivel === 'CRITICO' ? 'var(--critico-mid)' : 'var(--alerta-mid)'};"
        aria-label="${rel.id}">
        ${rel.id}
      </div>
      <div class="alert-card__body">
        <strong class="alert-card__region">${rel.periodo}</strong>
        <span class="alert-card__detail mono">
          ${rel.regioes} regiões · ${rel.alertas} alertas · ${textoNivel(rel.nivel)}
        </span>
      </div>
      <time class="alert-card__time mono">${rel.gerado} UTC</time>
    `;

    // Clicar em relatório do histórico reexibe no preview
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      const lista = filtrarRegioes('ciclo', 'todos', '');
      const txt   = montarTextoRelatorio(lista, 'ciclo', '', rel.id);
      DOM.previewTitle.textContent = `Relatório ${rel.id} — ${rel.periodo}`;
      DOM.previewBody.textContent  = txt;
      DOM.preview.removeAttribute('hidden');
      DOM.preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
      mostrarToast(`Exibindo ${rel.id}`);
    });

    DOM.historicoLista.appendChild(li);
  });
}

/* ── 10. SYNC AUTOMÁTICO (BOM — setInterval) ────────────────── */
function iniciarSync() {
  setInterval(() => {
    const h = String(new Date().getHours()).padStart(2,'0');
    const m = String(new Date().getMinutes()).padStart(2,'0');
    DOM.lastSync.textContent = `${h}:${m} UTC`;
  }, 30000);
}

/* ── 11. TOAST ──────────────────────────────────────────────── */
function mostrarToast(mensagem, duracao = 3500) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastMsg.textContent = mensagem;
  DOM.toast.removeAttribute('hidden');
  toastTimer = setTimeout(() => DOM.toast.setAttribute('hidden', ''), duracao);
}

/* ── 12. SIDEBAR MOBILE ─────────────────────────────────────── */
function iniciarSidebarMobile() {
  DOM.navToggle.addEventListener('click', () => {
    sidebarAberta = !sidebarAberta;
    DOM.sidebar.classList.toggle('is-open', sidebarAberta);
    DOM.navToggle.setAttribute('aria-expanded', String(sidebarAberta));
  });
  document.addEventListener('click', (e) => {
    if (sidebarAberta && !DOM.sidebar.contains(e.target) && e.target !== DOM.navToggle) {
      sidebarAberta = false;
      DOM.sidebar.classList.remove('is-open');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── 13. CSS EXTRA (injeta estilos específicos desta página) ── */
function injetarEstilos() {
  const style = document.createElement('style');
  style.textContent = `
    /* Formulário de relatório */
    .relatorio-form {
      padding: var(--sp-5) var(--sp-6) var(--sp-6);
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-4);
    }
    .form-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    /* Preview do relatório */
    .relatorio-preview {
      border-top: 1px solid var(--border-dim);
      margin: 0 var(--sp-6) var(--sp-6);
    }
    .preview__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-4) 0 var(--sp-3);
    }
    .preview__title {
      font-family: var(--font-display);
      font-size: .9rem;
      font-weight: 600;
      color: var(--teal-300);
    }
    .preview__body {
      background: var(--bg-deep);
      border: 1px solid var(--border-dim);
      border-radius: var(--radius-md);
      padding: var(--sp-5) var(--sp-6);
      font-size: .72rem;
      line-height: 1.65;
      color: var(--text-secondary);
      overflow-x: auto;
      white-space: pre;
      max-height: 480px;
      overflow-y: auto;
    }

    /* Lista de histórico */
    .relatorio-lista {
      display: flex;
      flex-direction: column;
      gap: 1px;
      max-height: 500px;
      overflow-y: auto;
    }
    .relatorio-lista::-webkit-scrollbar { width: 4px; }
    .relatorio-lista::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 4px; }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}

/* ── 14. INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injetarEstilos();
  renderizarHistorico();
  iniciarRelogio();
  iniciarSync();
  iniciarGerador();
  iniciarSidebarMobile();
});