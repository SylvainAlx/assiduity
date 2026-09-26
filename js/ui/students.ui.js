/**
 * js/ui/students.ui.js - Composant d'Affichage & Gestion de l'Effectif Élèves
 * Permet d'ajouter de nouveaux personnages/élèves et d'ajuster leur fiche.
 */

import { state } from '../state.js';

export function renderStudents() {
  const container = document.getElementById('students-grid');
  if (!container) return;

  if (state.students.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: var(--bg-card); border-radius: var(--border-radius);">
        <p style="color: var(--text-muted);">Aucun élève dans l'effectif pour le moment.</p>
      </div>`;
    return;
  }

  container.innerHTML = state.students.map(student => `
    <div class="student-card">
      <div class="student-header">
        <h3 style="font-size:1.1rem;">${escapeHtml(student.name)}</h3>
      </div>

      <div class="student-stats">
        <div>
          <span class="student-stat-val" style="color:var(--accent-green);">${student.points}</span>
          <span class="student-stat-lbl">Points</span>
        </div>
        <div>
          <span class="student-stat-val">🟢 ${student.stats.presents}</span>
          <span class="student-stat-lbl">Présent</span>
        </div>
        <div>
          <span class="student-stat-val">🟡 ${student.stats.lateShort}</span>
          <span class="student-stat-lbl">Retard</span>
        </div>
        <div>
          <span class="student-stat-val">🔴 ${student.stats.absents}</span>
          <span class="student-stat-lbl">Absent</span>
        </div>
      </div>

      <div class="student-actions">
        <button class="btn btn-secondary btn-adjust-pts" data-id="${student.id}">
          ⚙️ Ajuster Points
        </button>
        <button class="btn btn-secondary btn-edit-student" data-id="${student.id}">
          ✏️ Éditer
        </button>
        <button class="btn btn-secondary btn-delete-student" data-id="${student.id}" style="color:var(--accent-red);" title="Supprimer">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
