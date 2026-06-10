/* ============================================================
   ORBIS SENTINEL — alertas.js
   Web Development (WD) · Global Solution 2026 · FIAP
   ============================================================
   IDs do HTML que este arquivo controla:
     #clock                → relógio BOM
     #last-sync            → timestamp de sync
     #kpi-critico          → contador crítico
     #kpi-alerta           → contador alerta
     #kpi-encerrado        → contador encerrados (setTimeout)
     #count-critico        → badge do painel crítico
     #count-alerta         → badge do painel alerta
     #lista-criticos       → DOM — cards expandidos de crítico
     #lista-alertas        → DOM — cards de alerta
     #log-list             → DOM — log de eventos (aria-live)
     #btn-limpar-log       → evento click — limpa log
     #nav-toggle / .sidebar → sidebar mobile
     #toast / #toast-message → notificações
   ============================================================ */

'use strict';

/* ── 1. DATASET ─────────────────────────────────────────────── */
const REGIOES_CRITICO = [
  { regiao: 'Cerrado_TO_Setor_Norte',  focos: 31, ndvi: 0.16, umidade: 7.0,  tendencia: 'CRESCENTE', hora: '08:00 UTC' },
  { regiao: 'Cerrado_MT_Setor_Leste',  focos: 23, ndvi: 0.18, umidade: 8.5,  tendencia: 'CRESCENTE', hora: '08:00 UTC' },
  { regiao: 'Amazonia_AM_Setor_Norte', focos: 18, ndvi: 0.21, umidade: 11.0, tendencia: 'CRESCENTE', hora: '08:00 UTC' },
];

const REGIOES_ALERTA = [
  { regiao: 'Caatinga_BA_Setor_Central', focos: 9, ndvi: 0.29, umidade: 22.0, tendencia: 'CRESCENTE', hora: '08:00 UTC' },
  { regiao: 'Pantanal_MS_Setor_Oeste',   focos: 7, ndvi: 0.35, umidade: 29.0, tendencia: 'CRESCENTE', hora: '08:00 UTC' },
];

// Log inicial — simula eventos já ocorridos antes do carregamento da página
const LOG_INICIAL = [
  { nivel: 'CRITICO', msg: 'Foco detectado em Cerrado_TO_Setor_Norte — 31 focos, NDVI 0.16',     ts: '08:00' },
  { nivel: 'CRITICO', msg: 'Foco detectado em Cerrado_MT_Setor_Leste — 23 focos, NDVI 0.18',     ts: '08:00' },
  { nivel: 'CRITICO', msg: 'Foco detectado em Amazonia_AM_Setor_Norte — 18 focos, NDVI 0.21',    ts: '08:00' },
  { nivel: 'ALERTA',  msg: 'Pré-alerta em Caatinga_BA_Setor_Central — 9 focos, umidade 22%',     ts: '07:30' },
  { nivel: 'ALERTA',  msg: 'Pré-alerta em Pantanal_MS_Setor_Oeste — 7 focos, umidade 29%',       ts: '07:00' },
  { nivel: 'NORMAL',  msg: 'Ciclo analítico concluído — 9 regiões processadas sem novos eventos', ts: '06:30' },
];

/* ── 2. ESTADO ──────────────────────────────────────────────── */
let encerrados    = 0;
let sidebarAberta = false;
let toastTimer    = null;
let logEntries    = [...LOG_INICIAL];

/* ── 3. SELETORES ───────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);

const DOM = {
  clock:          $('#clock'),
  lastSync:       $('#last-sync'),
  kpiCritico:     $('#kpi-critico'),
  kpiAlerta:      $('#kpi-alerta'),
  kpiEncerrado:   $('#kpi-encerrado'),
  countCritico:   $('#count-critico'),
  countAlerta:    $('#count-alerta'),
  listaCriticos:  $('#lista-criticos'),
  listaAlertas:   $('#lista-alertas'),
  logList:        $('#log-list'),
  btnLimparLog:   $('#btn-limpar-log'),
  navToggle:      $('#nav-toggle'),
  sidebar:        $('.sidebar'),
  toast:          $('#toast'),
  toastMsg:       $('#toast-message'),
};

/* ── 4. UTILITÁRIOS ─────────────────────────────────────────── */
function horaAtual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} UTC`;
}

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

/* ── 6. CARDS EXPANDIDOS — CRÍTICO ─────────────────────────── */
function criarCardCritico(r, i) {
  const li = document.createElement('li');
  li.className = 'alerta-exp';
  li.setAttribute('role', 'listitem');
  li.style.animationDelay = `${i * 90}ms`;
  li.innerHTML = `
    <div class="alerta-exp__nivel">
      <span class="alerta-exp__badge" aria-label="Crítico">CRÍTICO</span>
      <span class="alerta-exp__pulse" aria-hidden="true"></span>
    </div>
    <div class="alerta-exp__body">
      <strong class="alerta-exp__regiao">${r.regiao.replace(/_/g, ' ')}</strong>
      <div class="alerta-exp__metricas">
        <div class="alerta-exp__metrica">
          <span class="alerta-exp__metrica-label">Focos</span>
          <span class="alerta-exp__metrica-valor mono">${r.focos}</span>
        </div>
        <div class="alerta-exp__metrica">
          <span class="alerta-exp__metrica-label">NDVI</span>
          <span class="alerta-exp__metrica-valor mono">${r.ndvi.toFixed(2)}</span>
        </div>
        <div class="alerta-exp__metrica">
          <span class="alerta-exp__metrica-label">Umidade</span>
          <span class="alerta-exp__metrica-valor mono">${r.umidade}%</span>
        </div>
        <div class="alerta-exp__metrica">
          <span class="alerta-exp__metrica-label">Tendência</span>
          <span class="alerta-exp__metrica-valor mono" style="color:var(--critico-main);">↑ ${r.tendencia}</span>
        </div>
      </div>
    </div>
    <div class="alerta-exp__meta">
      <time class="alerta-exp__hora mono">${r.hora}</time>
      <button class="btn btn--simulate"
        style="padding:3px 10px;font-size:.68rem;margin-top:6px;"
        aria-label="Encerrar alerta de ${r.regiao}"
        data-regiao="${r.regiao}"
        type="button">
        Encerrar
      </button>
    </div>
  `;

  // Botão encerrar — remove card, incrementa KPI, loga evento
  li.querySelector('button').addEventListener('click', () => {
    encerrados++;
    DOM.kpiEncerrado.textContent = encerrados;
    adicionarLog('NORMAL', `Alerta encerrado pelo operador: ${r.regiao.replace(/_/g, ' ')}`);
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    li.style.transition = 'all 300ms ease';
    setTimeout(() => {
      li.remove();
      atualizarContadores();
    }, 300);
    mostrarToast(`✓ Alerta encerrado: ${r.regiao.replace(/_/g, ' ')}`);
  });

  return li;
}

/* ── 7. CARDS COMPACTOS — ALERTA ────────────────────────────── */
function criarCardAlerta(r, i) {
  const li = document.createElement('li');
  li.className = 'alert-card alert-card--alerta';
  li.setAttribute('role', 'listitem');
  li.style.animationDelay = `${i * 80}ms`;
  li.innerHTML = `
    <div class="alert-card__level" aria-label="Alerta">ALERTA</div>
    <div class="alert-card__body">
      <strong class="alert-card__region">${r.regiao.replace(/_/g, ' ')}</strong>
      <span class="alert-card__detail mono">${r.focos} focos · NDVI ${r.ndvi.toFixed(2)} · ${r.umidade}% umid.</span>
    </div>
    <time class="alert-card__time mono">${r.hora}</time>
  `;
  return li;
}

/* ── 8. RENDER INICIAL ──────────────────────────────────────── */
function renderizarAlertas() {
  DOM.listaCriticos.innerHTML = '';
  REGIOES_CRITICO.forEach((r, i) => DOM.listaCriticos.appendChild(criarCardCritico(r, i)));

  DOM.listaAlertas.innerHTML = '';
  REGIOES_ALERTA.forEach((r, i) => DOM.listaAlertas.appendChild(criarCardAlerta(r, i)));

  atualizarContadores();
}

/* ── 9. ATUALIZA CONTADORES E BADGES ────────────────────────── */
function atualizarContadores() {
  const totalCrit  = DOM.listaCriticos.querySelectorAll('li').length;
  const totalAlert = DOM.listaAlertas.querySelectorAll('li').length;

  DOM.kpiCritico.textContent  = totalCrit;
  DOM.kpiAlerta.textContent   = totalAlert;
  DOM.countCritico.textContent = totalCrit;
  DOM.countCritico.setAttribute('aria-label', `${totalCrit} alertas críticos`);
  DOM.countAlerta.textContent  = totalAlert;
  DOM.countAlerta.setAttribute('aria-label', `${totalAlert} alertas`);

  // Atualiza badge do nav
  const navBadge = document.querySelector('.nav__badge');
  if (navBadge) {
    const total = totalCrit + totalAlert;
    navBadge.textContent = total;
    navBadge.setAttribute('aria-label', `${total} alertas ativos`);
  }
}

/* ── 10. LOG DE EVENTOS ─────────────────────────────────────── */
function renderizarLog() {
  DOM.logList.innerHTML = '';
  // Mais recentes primeiro
  [...logEntries].reverse().forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'log-entry';
    li.style.animationDelay = `${i * 30}ms`;
    li.innerHTML = `
      <span class="log-entry__ts mono">${entry.ts} UTC</span>
      <span class="log-entry__nivel log-entry__nivel--${entry.nivel.toLowerCase()}">${entry.nivel}</span>
      <span class="log-entry__msg">${entry.msg}</span>
    `;
    DOM.logList.appendChild(li);
  });
}

function adicionarLog(nivel, msg) {
  const h = String(new Date().getHours()).padStart(2,'0');
  const m = String(new Date().getMinutes()).padStart(2,'0');
  logEntries.push({ nivel, msg, ts: `${h}:${m}` });
  renderizarLog();
}

/* ── 11. CICLO AUTOMÁTICO (BOM — setInterval) ───────────────── */
// Simula novo ciclo analítico a cada 30s — atualiza focos e log
function iniciarCiclo() {
  setInterval(() => {
    const h = String(new Date().getHours()).padStart(2,'0');
    const m = String(new Date().getMinutes()).padStart(2,'0');
    DOM.lastSync.textContent = `${h}:${m} UTC`;

    // Atualiza focos nos cards críticos com pequena variação
    DOM.listaCriticos.querySelectorAll('.alerta-exp__metrica-valor').forEach((el, idx) => {
      if (idx % 4 === 0) { // só coluna "Focos" (índice 0 de cada grupo de 4)
        const atual = parseInt(el.textContent) || 0;
        const novo  = Math.max(0, atual + Math.round(Math.random() * 3 - 1));
        el.textContent = novo;
      }
    });

    adicionarLog('NORMAL', `Ciclo analítico executado — ${atualizarContadores() || ''} monitoramento contínuo ativo`);
  }, 30000);
}

/* ── 12. BOTÃO LIMPAR LOG (Evento click) ────────────────────── */
function iniciarBotaoLog() {
  DOM.btnLimparLog.addEventListener('click', () => {
    logEntries = [];
    DOM.logList.innerHTML = '';
    mostrarToast('Log de eventos limpo.');
  });
}

/* ── 13. TOAST ──────────────────────────────────────────────── */
function mostrarToast(mensagem, duracao = 3500) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastMsg.textContent = mensagem;
  DOM.toast.removeAttribute('hidden');
  toastTimer = setTimeout(() => DOM.toast.setAttribute('hidden', ''), duracao);
}

/* ── 14. SIDEBAR MOBILE ─────────────────────────────────────── */
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

/* ── 15. INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderizarAlertas();
  renderizarLog();
  iniciarRelogio();
  iniciarCiclo();
  iniciarBotaoLog();
  iniciarSidebarMobile();
});