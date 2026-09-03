/**
 * js/ui/rollcall.ui.js - Interface de la Feuille d'Appel (Séance de Match)
 * Permet à l'enseignant de saisir rapidement la présence de la classe en 1 clic.
 */

import { state } from '../state.js';

export function initRollCallDate() {
  const dateInput = document.getElementById('rollcall-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
}

export function renderRollCall() {
  const container = document.getElementById('rollcall-grid');
  if (!container) return;

  if (state.students.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--bg-card); border-radius: var(--border-radius);">
        <p style="color: var(--text-muted);">Aucun élève disponible pour l'appel.</p>
      </div>`;
    return;
  }

  container.innerHTML = state.students.map(student => `
    <div class="rollcall-card" data-student-id="${student.id}">
      <div class="rollcall-student-info">
        <div class="player-avatar">${student.avatar || '⚽'}</div>
        <div>
          <strong style="display:block;">${escapeHtml(student.name)}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">N° ${student.jerseyNumber} • ${student.role}</span>
        </div>
      </div>
      
      <div class="rollcall-options">
        <button type="button" class="option-btn selected" data-status="present">
          🟢 Présent<br><small>(+3 pts)</small>
        </button>
        <button type="button" class="option-btn" data-status="late_short">
          🟡 Retard &lt; 5m<br><small>(+1 pt)</small>
        </button>
        <button type="button" class="option-btn" data-status="absent">
          🔴 Absent<br><small>(0 pt)</small>
        </button>
      </div>
    </div>
  `).join('');

  // Attacher les écouteurs pour la sélection d'état sur chaque carte
  container.querySelectorAll('.rollcall-card').forEach(card => {
    const buttons = card.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });
}

export function getRollCallSelections() {
  const cards = document.querySelectorAll('.rollcall-card');
  const records = [];

  cards.forEach(card => {
    const studentId = card.getAttribute('data-student-id');
    const selectedBtn = card.querySelector('.option-btn.selected');
    const status = selectedBtn ? selectedBtn.getAttribute('data-status') : 'present';
    records.push({ studentId, status });
  });

  return records;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
