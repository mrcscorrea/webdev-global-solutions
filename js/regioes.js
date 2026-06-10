/* ============================================================
   ORBIS SENTINEL — regioes.js
   Web Development (WD) · Global Solution 2026 · FIAP
   ============================================================
   IDs do HTML que este arquivo controla:
     #clock              → relógio BOM
     #last-sync          → timestamp de sync
     #filter-bioma       → evento change — filtra tabela
     #regioes-tbody      → DOM — tabela populada via JS
     #biomas-grid        → DOM — cards de status por bioma
     #nav-toggle / .sidebar → sidebar mobile
     #toast / #toast-message → notificações
   ============================================================ */

'use strict';

/* ── 1. DATASET ─────────────────────────────────────────────
   Espelha dados.py (CTWP) — coerência entre todas as camadas */
const REGIOES = [
  { regiao: 'Cerrado_TO_Setor_Norte',      bioma: 'Cerrado',       estado: 'TO', area_km2: 3700, nivel: 'CRITICO', focos: 31, ndvi: 0.16, umidade: 7.0,  tendencia: 'CRESCENTE'  },
  { regiao: 'Cerrado_MT_Setor_Leste',      bioma: 'Cerrado',       estado: 'MT', area_km2: 3200, nivel: 'CRITICO', focos: 23, ndvi: 0.18, umidade: 8.5,  tendencia: 'CRESCENTE'  },
  { regiao: 'Amazonia_AM_Setor_Norte',     bioma: 'Amazonia',      estado: 'AM', area_km2: 4500, nivel: 'CRITICO', focos: 18, ndvi: 0.21, umidade: 11.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Caatinga_BA_Setor_Central',   bioma: 'Caatinga',      estado: 'BA', area_km2: 2800, nivel: 'ALERTA',  focos: 9,  ndvi: 0.29, umidade: 22.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Pantanal_MS_Setor_Oeste',     bioma: 'Pantanal',      estado: 'MS', area_km2: 6100, nivel: 'ALERTA',  focos: 7,  ndvi: 0.35, umidade: 29.0, tendencia: 'CRESCENTE'  },
  { regiao: 'Cerrado_GO_Setor_Sul',        bioma: 'Cerrado',       estado: 'GO', area_km2: 1900, nivel: 'ATENCAO', focos: 3,  ndvi: 0.44, umidade: 38.0, tendencia: 'ESTAVEL'    },
  { regiao: 'MataAtlantica_SP_Setor_Vale', bioma: 'MataAtlantica', estado: 'SP', area_km2: 1400, nivel: 'ATENCAO', focos: 2,  ndvi: 0.49, umidade: 43.0, tendencia: 'ESTAVEL'    },
  { regiao: 'Pampa_RS_Setor_Sul',          bioma: 'Pampa',         estado: 'RS', area_km2: 2100, nivel: 'NORMAL',  focos: 0,  ndvi: 0.72, umidade: 61.0, tendencia: 'ESTAVEL'    },
  { regiao: 'Amazonia_PA_Setor_Leste',     bioma: 'Amazonia',      estado: 'PA', area_km2: 5800, nivel: 'NORMAL',  focos: 0,  ndvi: 0.81, umidade: 74.0, tendencia: 'ESTAVEL'    },
];

/* ── 2. ESTADO ──────────────────────────────────────────────── */
let filtroBioma   = 'todos';
let sidebarAberta = false;
let toastTimer    = null;

/* ── 3. SELETORES ───────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);

const DOM = {
  clock:        $('#clock'),
  lastSync:     $('#last-sync'),
  filterBioma:  $('#filter-bioma'),
  tbody:        $('#regioes-tbody'),
  biomasGrid:   $('#biomas-grid'),
  navToggle:    $('#nav-toggle'),
  sidebar:      $('.sidebar'),
  toast:        $('#toast'),
  toastMsg:     $('#toast-message'),
};

/* ── 4. UTILITÁRIOS ─────────────────────────────────────────── */
function classeNivel(n) {
  return { CRITICO: 'critico', ALERTA: 'alerta', ATENCAO: 'atencao', NORMAL: 'normal' }[n] || 'normal';
}
function textoNivel(n) {
  return { CRITICO: 'CRÍTICO', ALERTA: 'ALERTA', ATENCAO: 'ATENÇÃO', NORMAL: 'NORMAL' }[n] || n;
}
function textoTend(t) {
  if (t === 'CRESCENTE')  return '<span class="trend trend--up"   aria-label="Crescente">↑ Crescente</span>';
  if (t === 'DECRESCENTE') return '<span class="trend trend--down" aria-label="Decrescente">↓ Decrescente</span>';
  return '<span class="trend trend--stable" aria-label="Estável">— Estável</span>';
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

/* ── 6. SYNC AUTOMÁTICA (BOM — setInterval) ────────────────── */
function iniciarSync() {
  setInterval(() => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    DOM.lastSync.textContent = `${h}:${m} UTC`;

    // Simula pequena variação nos focos para dar vida à página
    REGIOES.forEach(r => {
      if (r.nivel === 'CRITICO' || r.nivel === 'ALERTA') {
        r.focos = Math.max(0, r.focos + Math.round(Math.random() * 2 - 0.8));
      }
    });
    renderizarTabela();
    renderizarBiomas();
  }, 30000); // a cada 30s — espelha ciclo analítico Python
}

/* ── 7. TABELA DE REGIÕES ───────────────────────────────────── */
function renderizarTabela() {
  const lista = filtroBioma === 'todos'
    ? REGIOES
    : REGIOES.filter(r => r.bioma === filtroBioma);

  DOM.tbody.innerHTML = '';

  if (lista.length === 0) {
    DOM.tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);font-family:var(--font-mono);font-size:.8rem;">
          Nenhuma região encontrada para este filtro.
        </td>
      </tr>`;
    return;
  }

  lista.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.className = `row--${classeNivel(r.nivel)}`;
    tr.dataset.nivel = r.nivel;
    tr.dataset.bioma = r.bioma;
    tr.style.animationDelay = `${i * 45}ms`;
    tr.innerHTML = `
      <td><span class="badge badge--${classeNivel(r.nivel)}" aria-label="Nível ${textoNivel(r.nivel)}">${textoNivel(r.nivel)}</span></td>
      <td class="col--region">${r.regiao}</td>
      <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-secondary);">${r.bioma.replace('MataAtlantica', 'Mata Atlântica')}</td>
      <td style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-muted);">${r.estado}</td>
      <td class="col--numeric"><span class="mono">${r.area_km2.toLocaleString('pt-BR')}</span></td>
      <td class="col--numeric"><span class="mono">${r.focos}</span></td>
      <td class="col--numeric"><span class="mono">${r.ndvi.toFixed(2)}</span></td>
      <td class="col--numeric"><span class="mono">${r.umidade.toFixed(1)}%</span></td>
      <td>${textoTend(r.tendencia)}</td>
    `;
    DOM.tbody.appendChild(tr);
  });
}

/* ── 8. CARDS DE BIOMA ──────────────────────────────────────── */
function renderizarBiomas() {
  // Agrupa regiões por bioma e pega o pior nível
  const ordemNivel = { CRITICO: 0, ALERTA: 1, ATENCAO: 2, NORMAL: 3 };
  const biomas = {};

  REGIOES.forEach(r => {
    const key = r.bioma;
    if (!biomas[key]) {
      biomas[key] = { nome: r.bioma, regioes: 0, focos: 0, piorNivel: 'NORMAL' };
    }
    biomas[key].regioes++;
    biomas[key].focos += r.focos;
    if (ordemNivel[r.nivel] < ordemNivel[biomas[key].piorNivel]) {
      biomas[key].piorNivel = r.nivel;
    }
  });

  const icones = {
    Amazonia: '<img src="../assets/amazonia.png" alt="Amazônia" style="width: 50px; height: 50px;"/>',
    Cerrado: '<img src="../assets/cerrado.png" alt="Cerrado" style="width: 50px; height: 50px;"/>',
    Pantanal: '<img src="../assets/pantanal.png" alt="Pantanal" style="width: 50px; height: 50px;"/>',
    Caatinga: '<img src="../assets/caatinga.png" alt="Caatinga" style="width: 50px; height: 50px;"/>',
    MataAtlantica: '<img src="../assets/mataatlantica.png" alt="Mata Atlântica" style="width: 50px; height: 50px;"/>',
    Pampa: '<img src="../assets/pampa.png" alt="Pampa" style="width: 50px; height: 50px;"/>'
  };
  const nomeExibicao = {
    Amazonia: 'Amazônia', Cerrado: 'Cerrado', Pantanal: 'Pantanal',
    Caatinga: 'Caatinga', MataAtlantica: 'Mata Atlântica', Pampa: 'Pampa'
  };

  DOM.biomasGrid.innerHTML = '';

  Object.values(biomas).forEach(b => {
    const cl = classeNivel(b.piorNivel);
    const statusClass = b.piorNivel === 'CRITICO' ? 'sensor-card__status--crit'
                      : b.piorNivel === 'NORMAL'  ? 'sensor-card__status--ok'
                      : 'sensor-card__status--warn';

    const card = document.createElement('article');
    card.className = 'sensor-card';
    card.setAttribute('aria-label', `Status do bioma ${nomeExibicao[b.nome]}`);
    card.innerHTML = `
      <span class="sensor-card__icon" aria-hidden="true">${icones[b.nome] || '🌍'}</span>
      <span class="sensor-card__label">${nomeExibicao[b.nome]}</span>
      <span class="sensor-card__value mono">${b.focos} focos</span>
      <span class="sensor-card__status ${statusClass}" aria-live="polite">
        ${textoNivel(b.piorNivel)} · ${b.regioes} região(ões)
      </span>
    `;

    // Clique no card filtra a tabela para aquele bioma
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      DOM.filterBioma.value = b.nome;
      filtroBioma = b.nome;
      renderizarTabela();
      mostrarToast(`Filtrando: ${nomeExibicao[b.nome]}`);
      // Scroll suave até a tabela
      document.querySelector('.panel--regions').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    DOM.biomasGrid.appendChild(card);
  });
}

/* ── 9. FILTRO POR BIOMA (Evento change) ────────────────────── */
function iniciarFiltro() {
  DOM.filterBioma.addEventListener('change', (e) => {
    filtroBioma = e.target.value;
    renderizarTabela();
  });
}

/* ── 10. TOAST ──────────────────────────────────────────────── */
function mostrarToast(mensagem, duracao = 3500) {
  if (toastTimer) clearTimeout(toastTimer);
  DOM.toastMsg.textContent = mensagem;
  DOM.toast.removeAttribute('hidden');
  toastTimer = setTimeout(() => DOM.toast.setAttribute('hidden', ''), duracao);
}

/* ── 11. SIDEBAR MOBILE (BOM — toggle) ─────────────────────── */
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

/* ── 12. INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderizarTabela();
  renderizarBiomas();
  iniciarRelogio();
  iniciarSync();
  iniciarFiltro();
  iniciarSidebarMobile();
});