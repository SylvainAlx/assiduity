/**
 * js/ui/history.ui.js - Journal d'Historique Daté des Points
 * Affiche la chronologie exacte de toutes les attributions de points et ajustements manuels.
 */

import { state } from '../state.js';

export function renderHistory() {
  const container = document.getElementById('history-timeline');
  const filterSelect = document.getElementById('filter-history-student');
  if (!container) return;

  // Mise à jour des options du filtre élèves
  if (filterSelect) {
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="all">Tous les élèves</option>` + 
      state.students.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    filterSelect.value = currentVal || 'all';
  }

  const selectedStudentId = filterSelect ? filterSelect.value : 'all';
  
  // Filtrage de l'historique
  let filteredHistory = [...state.history];
  if (selectedStudentId !== 'all') {
    filteredHistory = filteredHistory.filter(h => h.studentId === selectedStudentId);
  }

  if (filteredHistory.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: var(--bg-card); border-radius: var(--border-radius);">
        <p style="color: var(--text-muted);">Aucun événement dans l'historique pour le moment.</p>
      </div>`;
    return;
  }

  container.innerHTML = filteredHistory.map(item => {
    let itemClass = 'neutral';
    let deltaDisplay = `+${item.delta}`;
    if (item.delta > 0) itemClass = 'positive';
    else if (item.delta < 0) {
      itemClass = 'negative';
      deltaDisplay = `${item.delta}`;
    }

    const formattedDate = formatDateFR(item.date);

    return `
      <div class="history-item ${itemClass}">
        <div class="history-desc">
          <span style="font-size:1.3rem;">${item.type === 'rollcall' ? '📋' : '⚙️'}</span>
          <div>
            <strong style="display:block; font-size:0.95rem;">${escapeHtml(item.studentName)}</strong>
            <span style="font-size:0.85rem; color:var(--text-main);">${escapeHtml(item.reason)}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:1.5rem;">
          <span class="history-date">📅 ${formattedDate}</span>
          <span class="history-delta" style="color: ${item.delta > 0 ? 'var(--accent-green)' : item.delta < 0 ? 'var(--accent-red)' : 'var(--text-muted)'};">
            ${deltaDisplay} pt${Math.abs(item.delta) > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

/** Formate une date ISO YYYY-MM-DD en français JJ/MM/AAAA */
function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
