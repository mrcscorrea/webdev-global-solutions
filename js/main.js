/* ============================================================
   ORBIS SENTINEL — main.js
   Web Development (WD) · Global Solution 2026 · FIAP
   ============================================================
   Cobertura de requisitos WD:
     ✓ Manipulação de DOM  — tabela, alertas, KPIs, sensores
     ✓ Eventos             — botões, filtro, login, teclado
     ✓ BOM                 — setInterval (relógio, sensores,
                             ciclo), setTimeout (toast)
     ✓ Validação de form   — campos obrigatórios + feedback
     ✓ Simulador de alerta — botão ativa nova linha + toast
     ✓ Sidebar mobile      — toggle com aria
   ============================================================ */

'use strict';

// ── 1. DADOS ─────────────────────────────────────────────────
// Dataset espelha dados.py (CTWP) — coerência total do projeto
const REGIOES = [
  { regiao: 'Cerrado_TO_Setor_Norte',      nivel: 'CRITICO', focos: 31, ndvi: 0.16, umidade: 7.0,  tendencia: 'CRESCENTE' },
  { regiao: 'Cerrado_MT_Setor_Leste',      nivel: 'CRITICO', focos: 23, ndvi: 0.18, umidade: 8.5,  tendencia: 'CRESCENTE' },
  { regiao: 'Amazonia_AM_Setor_Norte',     nivel: 'CRITICO', focos: 18, ndvi: 0.21, umidade: 11.0, tendencia: 'CRESCENTE' },
  { regiao: 'Caatinga_BA_Setor_Central',   nivel: 'ALERTA',  focos: 9,  ndvi: 0.29, umidade: 22.0, tendencia: 'CRESCENTE' },
  { regiao: 'Pantanal_MS_Setor_Oeste',     nivel: 'ALERTA',  focos: 7,  ndvi: 0.35, umidade: 29.0, tendencia: 'CRESCENTE' },
  { regiao: 'Cerrado_GO_Setor_Sul',        nivel: 'ATENCAO', focos: 3,  ndvi: 0.44, umidade: 38.0, tendencia: 'ESTAVEL'   },
  { regiao: 'MataAtlantica_SP_Setor_Vale', nivel: 'ATENCAO', focos: 2,  ndvi: 0.49, umidade: 43.0, tendencia: 'ESTAVEL'   },
  { regiao: 'Pampa_RS_Setor_Sul',          nivel: 'NORMAL',  focos: 0,  ndvi: 0.72, umidade: 61.0, tendencia: 'ESTAVEL'   },
  { regiao: 'Amazonia_PA_Setor_Leste',     nivel: 'NORMAL',  focos: 0,  ndvi: 0.81, umidade: 74.0, tendencia: 'ESTAVEL'   },
];

// Regiões extras para simular novos alertas chegando
const REGIOES_SIMULADAS = [
  { regiao: 'Cerrado_PI_Setor_Norte',   nivel: 'CRITICO', focos: 14, ndvi: 0.20, umidade: 9.0,  tendencia: 'CRESCENTE' },
  { regiao: 'Caatinga_CE_Setor_Leste',  nivel: 'ALERTA',  focos: 6,  ndvi: 0.31, umidade: 26.0, tendencia: 'CRESCENTE' },
  { regiao: 'Pantanal_MT_Setor_Norte',  nivel: 'CRITICO', focos: 19, ndvi: 0.17, umidade: 8.0,  tendencia: 'CRESCENTE' },
  { regiao: 'Amazonia_RO_Setor_Oeste',  nivel: 'ALERTA',  focos: 8,  ndvi: 0.28, umidade: 24.0, tendencia: 'CRESCENTE' },
];

// Leituras simuladas para o nó Arduino (variam ao longo do tempo)
const SENSOR_CICLOS = [
  { temp: 38.4, umid: 22.1, fumaca: 312,  status: 'ALERTA'  },
  { temp: 41.2, umid: 19.8, fumaca: 380,  status: 'ALERTA'  },
  { temp: 36.7, umid: 24.5, fumaca: 210,  status: 'ATENCAO' },
  { temp: 28.3, umid: 55.0, fumaca: 80,   status: 'NORMAL'  },
  { temp: 45.6, umid: 16.2, fumaca: 520,  status: 'CRITICO' },
  { temp: 33.1, umid: 31.0, fumaca: 190,  status: 'ATENCAO' },
];

// Credenciais de teste (WD — US16)
const CREDENCIAIS_VALIDAS = {
  "carlos.mendes": "orbis2026",
  "fiap.adm": "fiap2026",
  "antonio.fiap": "webdevelopment"
};

// ── 2. ESTADO DA APLICAÇÃO ───────────────────────────────────
let filtroAtual      = 'todos';
let sensorIdx        = 0;
let simIdx           = 0;
let logado           = false;
let sidebarAberta    = false;
let toastTimer       = null;
let regioes          = [...REGIOES];

// ── 3. SELETORES DE DOM ──────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const DOM = {
  clock:           $('#clock'),
  lastSync:        $('#last-sync'),
  filterNivel:     $('#filter-nivel'),
  regionsTbody:    $('#regions-tbody'),
  alertsList:      $('#alerts-list'),
  btnSimulate:     $('#btn-simulate'),
  kpiCritico:      $('#kpi-critico'),
  kpiAlerta:       $('#kpi-alerta'),
  kpiFocos:        $('#kpi-focos'),
  kpiNormal:       $('#kpi-normal'),
  sensorTemp:      $('#sensor-temp'),
  sensorUmid:      $('#sensor-umid'),
  sensorFumaca:    $('#sensor-fumaca'),
  sensorStatus:    $('#sensor-status'),
  sensorTempSt:    $('#sensor-temp-status'),
  sensorUmidSt:    $('#sensor-umid-status'),
  sensorFumacaSt:  $('#sensor-fumaca-status'),
  sensorNodeSt:    $('#sensor-node-status'),
  modalOverlay:    $('#modal-overlay'),
  modalClose:      $('#modal-close'),
  loginUser:       $('#login-user'),
  loginPass:       $('#login-pass'),
  btnLogin:        $('#btn-login'),
  errorUser:       $('#error-user'),
  errorPass:       $('#error-pass'),
  errorGeneral:    $('#error-general'),
  toast:           $('#toast'),
  toastMessage:    $('#toast-message'),
  navToggle:       $('#nav-toggle'),
  sidebar:         $('.sidebar'),
};

// ── 4. UTILITÁRIOS ───────────────────────────────────────────

/** Mapeia nível para classe CSS */
function classeNivel(nivel) {
  const mapa = { CRITICO: 'critico', ALERTA: 'alerta', ATENCAO: 'atencao', NORMAL: 'normal' };
  return mapa[nivel] || 'normal';
}

/** Mapeia nível para texto de badge com acento */
function textoNivel(nivel) {
  const mapa = { CRITICO: 'CRÍTICO', ALERTA: 'ALERTA', ATENCAO: 'ATENÇÃO', NORMAL: 'NORMAL' };
  return mapa[nivel] || nivel;
}

/** Mapeia tendência para ícone + texto */
function textoTendencia(t) {
  if (t === 'CRESCENTE') return '<span class="trend trend--up" aria-label="Tendência crescente">↑ Crescente</span>';
  if (t === 'DECRESCENTE') return '<span class="trend trend--down" aria-label="Tendência decrescente">↓ Decrescente</span>';
  return '<span class="trend trend--stable" aria-label="Tendência estável">— Estável</span>';
}

/** Formata hora UTC atual */
function horaUtc() {
  return new Date().toUTCString().split(' ')[4] + ' UTC';
}

/** Atualiza contadores KPI com base em regioes[] */
function recalcularKPIs() {
  const cnt = { CRITICO: 0, ALERTA: 0, ATENCAO: 0, NORMAL: 0 };
  let totalFocos = 0;
  regioes.forEach(r => {
    cnt[r.nivel] = (cnt[r.nivel] || 0) + 1;
    totalFocos  += r.focos;
  });
  DOM.kpiCritico.textContent = cnt.CRITICO || 0;
  DOM.kpiAlerta.textContent  = cnt.ALERTA  || 0;
  DOM.kpiFocos.textContent   = totalFocos;
  DOM.kpiNormal.textContent  = cnt.NORMAL  || 0;

  // Atualiza badge do nav
  const navBadge = $('.nav__badge');
  if (navBadge) {
    const total = (cnt.CRITICO || 0) + (cnt.ALERTA || 0);
    navBadge.textContent = total;
    navBadge.setAttribute('aria-label', `${total} alertas ativos`);
  }

  // Atualiza count no painel de alertas
  const panelCount = $('.panel__count');
  if (panelCount) {
    const totalAlert = (cnt.CRITICO || 0) + (cnt.ALERTA || 0);
    panelCount.textContent = totalAlert;
    panelCount.setAttribute('aria-label', `${totalAlert} alertas ativos`);
  }
}

// ── 5. TABELA DE REGIÕES ─────────────────────────────────────

/** Renderiza uma linha da tabela */
function criarLinha(r) {
  const tr = document.createElement('tr');
  tr.className   = `row--${classeNivel(r.nivel)}`;
  tr.dataset.nivel = r.nivel;
  tr.innerHTML = `
    <td><span class="badge badge--${classeNivel(r.nivel)}" aria-label="Nível ${textoNivel(r.nivel)}">${textoNivel(r.nivel)}</span></td>
    <td class="col--region">${r.regiao}</td>
    <td class="col--numeric"><span class="mono">${r.focos}</span></td>
    <td class="col--numeric"><span class="mono">${r.ndvi.toFixed(2)}</span></td>
    <td class="col--numeric"><span class="mono">${r.umidade.toFixed(1)}%</span></td>
    <td>${textoTendencia(r.tendencia)}</td>
  `;
  return tr;
}

/** Renderiza toda a tabela respeitando filtro */
function renderizarTabela() {
  const filtradas = filtroAtual === 'todos'
    ? regioes
    : regioes.filter(r => r.nivel === filtroAtual);

  DOM.regionsTbody.innerHTML = '';
  filtradas.forEach((r, i) => {
    const tr = criarLinha(r);
    tr.style.animationDelay = `${i * 40}ms`;
    DOM.regionsTbody.appendChild(tr);
  });
}

// ── 6. PAINEL DE ALERTAS ─────────────────────────────────────

/** Cria um card de alerta */
function criarAlertaCard(r) {
  const li = document.createElement('li');
  li.className = `alert-card alert-card--${classeNivel(r.nivel)}`;
  li.setAttribute('role', 'listitem');
  const hora = horaUtc();
  li.innerHTML = `
    <div class="alert-card__level" aria-label="${textoNivel(r.nivel)}">${textoNivel(r.nivel)}</div>
    <div class="alert-card__body">
      <strong class="alert-card__region">${r.regiao.replace(/_/g, ' ')}</strong>
      <span class="alert-card__detail mono">${r.focos} focos · NDVI ${r.ndvi.toFixed(2)} · ${r.umidade}% umid.</span>
    </div>
    <time class="alert-card__time mono">${hora}</time>
  `;
  return li;
}

/** Re-renderiza lista de alertas (CRITICO + ALERTA) */
function renderizarAlertas() {
  const alertas = regioes.filter(r => r.nivel === 'CRITICO' || r.nivel === 'ALERTA');
  DOM.alertsList.innerHTML = '';
  alertas.forEach((r, i) => {
    const li = criarAlertaCard(r);
    li.style.animationDelay = `${i * 60}ms`;
    DOM.alertsList.appendChild(li);
  });
}

// ── 7. RELÓGIO (BOM — setInterval) ───────────────────────────
function iniciarRelogio() {
  function tick() {
    const agora = new Date();
    const h = String(agora.getHours()).padStart(2, '0');
    const m = String(agora.getMinutes()).padStart(2, '0');
    const s = String(agora.getSeconds()).padStart(2, '0');
    const str = `${h}:${m}:${s}`;
    DOM.clock.textContent = str;
    DOM.clock.setAttribute('datetime', agora.toISOString());
  }
  tick();
  setInterval(tick, 1000);
}

// ── 8. ATUALIZAÇÃO AUTOMÁTICA DE SENSORES (BOM — setInterval)
// Simula chegada de dados do nó Arduino de campo a cada 10s
function iniciarSensores() {
  function atualizar() {
    const leitura = SENSOR_CICLOS[sensorIdx % SENSOR_CICLOS.length];
    sensorIdx++;

    // Aplica pequena variação aleatória para parecer "ao vivo"
    const tempVar = (leitura.temp + (Math.random() * 1.6 - 0.8)).toFixed(1);
    const umidVar = (leitura.umid + (Math.random() * 2 - 1)).toFixed(1);
    const fumVar  = Math.max(0, leitura.fumaca + Math.round(Math.random() * 20 - 10));

    DOM.sensorTemp.textContent   = `${tempVar}°C`;
    DOM.sensorUmid.textContent   = `${umidVar}%`;
    DOM.sensorFumaca.textContent = `${fumVar} ADC`;
    DOM.sensorStatus.textContent = leitura.status;

    // Atualiza classes de status dos sensores
    const classeStatus = leitura.status === 'CRITICO' ? 'sensor-card__status--crit'
                       : leitura.status === 'NORMAL'  ? 'sensor-card__status--ok'
                       : 'sensor-card__status--warn';

    [DOM.sensorTempSt, DOM.sensorUmidSt, DOM.sensorFumacaSt, DOM.sensorNodeSt].forEach(el => {
      el.className = `sensor-card__status ${classeStatus}`;
    });
    DOM.sensorTempSt.textContent   = leitura.status;
    DOM.sensorUmidSt.textContent   = leitura.status;
    DOM.sensorFumacaSt.textContent = leitura.status;
    DOM.sensorNodeSt.textContent   = 'ATIVO';

    // Atualiza timestamp da última sync
    const agora = new Date();
    const h = String(agora.getHours()).padStart(2,'0');
    const m = String(agora.getMinutes()).padStart(2,'0');
    DOM.lastSync.textContent = `${h}:${m} UTC`;
  }

  atualizar(); // imediato
  setInterval(atualizar, 10000); // a cada 10 segundos
}

// ── 9. FILTRO DA TABELA (Evento change) ──────────────────────
function iniciarFiltro() {
  DOM.filterNivel.addEventListener('change', (e) => {
    filtroAtual = e.target.value;
    renderizarTabela();
  });
}

// ── 10. TOAST ────────────────────────────────────────────────
function mostrarToast(mensagem, duracao = 4000) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastMessage.textContent = mensagem;
  DOM.toast.removeAttribute('hidden');
  toastTimer = setTimeout(() => {
    DOM.toast.setAttribute('hidden', '');
  }, duracao);
}

// ── 11. SIMULADOR DE ALERTA (Evento click — BOM alert) ───────
function iniciarSimulador() {
  DOM.btnSimulate.addEventListener('click', () => {
    const nova = REGIOES_SIMULADAS[simIdx % REGIOES_SIMULADAS.length];
    simIdx++;

    // Adiciona ao array de dados
    regioes.unshift({ ...nova });

    // Atualiza DOM
    renderizarTabela();
    renderizarAlertas();
    recalcularKPIs();

    // Toast de notificação
    mostrarToast(`⚠ Novo alerta detectado: ${nova.regiao.replace(/_/g, ' ')} — ${textoNivel(nova.nivel)}`);

    // Alerta nativo do navegador para CRITICO (BOM — window.alert)
    if (nova.nivel === 'CRITICO') {
      setTimeout(() => {
        window.alert(
          `ORBIS SENTINEL — ALERTA CRÍTICO\n\n` +
          `Região: ${nova.regiao.replace(/_/g, ' ')}\n` +
          `Focos detectados: ${nova.focos}\n` +
          `NDVI: ${nova.ndvi.toFixed(2)}\n` +
          `Umidade: ${nova.umidade}%\n\n` +
          `Ação imediata requerida. Acione brigada de campo.`
        );
      }, 200);
    }
  });
}

// ── 12. MODAL DE LOGIN ────────────────────────────────────────

/** Limpa erros do formulário */
function limparErros() {
  DOM.errorUser.textContent    = '';
  DOM.errorPass.textContent    = '';
  DOM.errorGeneral.textContent = '';
  DOM.loginUser.classList.remove('form-input--error');
  DOM.loginPass.classList.remove('form-input--error');
}

/** Abre o modal de login */
function abrirModal() {
  DOM.modalOverlay.removeAttribute('hidden');
  DOM.loginUser.focus();
  document.body.style.overflow = 'hidden';
}

/** Fecha o modal de login */
function fecharModal() {
  DOM.modalOverlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
  limparErros();
  DOM.loginUser.value = '';
  DOM.loginPass.value = '';
}

/** Valida e processa o login */
function processarLogin() {
  limparErros();
  const usuario = DOM.loginUser.value.trim();
  const senha   = DOM.loginPass.value;
  let valido    = true;

  // Validação de campos obrigatórios
  if (!usuario) {
    DOM.errorUser.textContent = 'Usuário é obrigatório';
    DOM.loginUser.classList.add('form-input--error');
    DOM.loginUser.focus();
    valido = false;
  }
  if (!senha) {
    DOM.errorPass.textContent = 'Senha é obrigatória';
    DOM.loginPass.classList.add('form-input--error');
    if (valido) DOM.loginPass.focus();
    valido = false;
  }
  if (!valido) return;

  // Verifica credenciais
  if (CREDENCIAIS_VALIDAS[usuario] && CREDENCIAIS_VALIDAS[usuario] === senha) {
    logado = true;
    fecharModal();
    mostrarToast(`✓ Bem-vindo, ${usuario}. Acesso ao painel de controle liberado.`, 5000);
  } else {
    DOM.errorGeneral.textContent = 'Credenciais inválidas. Verifique usuário e senha.';
    DOM.loginPass.classList.add('form-input--error');
    DOM.loginPass.focus();
  }
}

function iniciarModal() {
  // O botão "Simular Alerta" abre o login se não logado
  // (sobrescreve o listener anterior com lógica condicional)
  DOM.btnSimulate.addEventListener('click', () => {
    if (!logado) {
      abrirModal();
    }
    // Se já logado, o listener do simulador cuida do resto
    // (a ordem de registro garante: modal primeiro, simulador depois)
  }, true); // capture phase — primeiro

  DOM.modalClose.addEventListener('click', fecharModal);

  DOM.btnLogin.addEventListener('click', processarLogin);

  // Tecla Enter no form
  [DOM.loginUser, DOM.loginPass].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') processarLogin();
    });
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !DOM.modalOverlay.hasAttribute('hidden')) {
      fecharModal();
    }
  });

  // Clique fora do modal fecha
  DOM.modalOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.modalOverlay) fecharModal();
  });
}

// ── 13. SIDEBAR MOBILE (BOM — toggle) ────────────────────────
function iniciarSidebarMobile() {
  DOM.navToggle.addEventListener('click', () => {
    sidebarAberta = !sidebarAberta;
    DOM.sidebar.classList.toggle('is-open', sidebarAberta);
    DOM.navToggle.setAttribute('aria-expanded', String(sidebarAberta));
  });

  // Fecha sidebar ao clicar fora
  document.addEventListener('click', (e) => {
    if (sidebarAberta
      && !DOM.sidebar.contains(e.target)
      && e.target !== DOM.navToggle) {
      sidebarAberta = false;
      DOM.sidebar.classList.remove('is-open');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── 14. CICLO ANALÍTICO (BOM — setInterval) ──────────────────
// Simula o motor Python rodando a cada 30 segundos no dashboard
function iniciarCicloAnalitico() {
  setInterval(() => {
    // Pequena flutuação nos focos das regiões críticas
    regioes.forEach(r => {
      if (r.nivel === 'CRITICO' || r.nivel === 'ALERTA') {
        const delta = Math.round(Math.random() * 3 - 1);
        r.focos = Math.max(0, r.focos + delta);
      }
    });
    renderizarTabela();
    recalcularKPIs();

    const h = String(new Date().getHours()).padStart(2,'0');
    const m = String(new Date().getMinutes()).padStart(2,'0');
    DOM.lastSync.textContent = `${h}:${m} UTC`;
  }, 30000);
}

// ── 15. INICIALIZAÇÃO ─────────────────────────────────────────
function init() {
  renderizarTabela();
  renderizarAlertas();
  recalcularKPIs();
  iniciarRelogio();
  iniciarSensores();
  iniciarFiltro();
  iniciarSimulador();
  iniciarModal();
  iniciarSidebarMobile();
  iniciarCicloAnalitico();
}

// Aguarda DOM pronto
document.addEventListener('DOMContentLoaded', init);