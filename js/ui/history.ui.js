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

  const groupedHistory = groupHistoryByDate(filteredHistory);

  container.innerHTML = groupedHistory.map(group => `
    <details class="history-day">
      <summary class="history-day-header">
        <h3>📅 ${formatDateFR(group.date)}</h3>
        <span class="history-day-count">
          ${group.rollcalls.length > 0 ? `${group.rollcalls.length} élève${group.rollcalls.length > 1 ? 's' : ''} appelé${group.rollcalls.length > 1 ? 's' : ''}` : ''}
          ${group.manuals.length > 0 ? `${group.rollcalls.length > 0 ? ' · ' : ''}${group.manuals.length} ajustement${group.manuals.length > 1 ? 's' : ''}` : ''}
        </span>
      </summary>

      ${group.rollcalls.length > 0 ? `
        <div class="history-call-list">
          ${group.rollcalls.map(renderRollCallEntry).join('')}
        </div>` : ''}

      ${group.manuals.map(renderManualEntry).join('')}
    </details>
  `).join('');
}

function groupHistoryByDate(history) {
  const groups = [];
  const groupsByDate = new Map();

  history.forEach(item => {
    const date = item.date || 'Date inconnue';
    let group = groupsByDate.get(date);
    if (!group) {
      group = { date, rollcalls: [], manuals: [] };
      groupsByDate.set(date, group);
      groups.push(group);
    }

    if (item.type === 'rollcall') group.rollcalls.push(item);
    else group.manuals.push(item);
  });

  return groups.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function renderRollCallEntry(item) {
  const status = getRollCallStatus(item);
  const statusDetails = {
    present: { label: 'Présent', className: 'present', points: 3, emoji: '🟢' },
    late_short: { label: 'Retard de moins de 5 min', className: 'late', points: 1, emoji: '🟡' },
    absent: { label: 'Absent', className: 'absent', points: 0, emoji: '🔴' }
  }[status];

  return `
    <div class="history-call-row">
      <div class="history-call-student">
        <strong>${escapeHtml(item.studentName)}</strong>
        <span class="history-status ${statusDetails.className}">
          ${statusDetails.emoji} ${statusDetails.label}
        </span>
      </div>
      <div class="history-call-actions">
        <span class="history-delta ${statusDetails.className}">
          +${statusDetails.points} pt${statusDetails.points > 1 ? 's' : ''}
        </span>
        <button class="btn btn-secondary btn-edit-rollcall" data-id="${item.id}" title="Corriger cet appel">
          ✏️ Modifier
        </button>
      </div>
    </div>
  `;
}

function renderManualEntry(item) {
  const itemClass = item.delta > 0 ? 'positive' : item.delta < 0 ? 'negative' : 'neutral';
  const deltaDisplay = item.delta > 0 ? `+${item.delta}` : `${item.delta}`;

  return `
    <div class="history-item ${itemClass}">
      <div class="history-desc">
        <span style="font-size:1.3rem;">⚙️</span>
        <div>
          <strong style="display:block; font-size:0.95rem;">${escapeHtml(item.studentName)}</strong>
          <span style="font-size:0.85rem; color:var(--text-main);">${escapeHtml(item.reason)}</span>
        </div>
      </div>
      <span class="history-delta" style="color: ${item.delta > 0 ? 'var(--accent-green)' : item.delta < 0 ? 'var(--accent-red)' : 'var(--text-muted)'};">
        ${deltaDisplay} pt${Math.abs(item.delta) > 1 ? 's' : ''}
      </span>
    </div>
  `;
}

function getRollCallStatus(entry) {
  if (['present', 'late_short', 'absent'].includes(entry.status)) return entry.status;
  if (Number(entry.delta) === 3) return 'present';
  if (Number(entry.delta) === 1) return 'late_short';
  return 'absent';
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
