/**
 * js/ui/leaderboard.ui.js - Composant UI du Classement Général (Ligue de Football)
 * Trie les élèves selon le barème et génère la table d'honneur interactive.
 */

import { state } from '../state.js';

export function renderLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  if (!tbody) return;

  // Tri des élèves : Points desc > Présences desc > Nom asc
  const sortedStudents = [...state.students].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stats.presents !== a.stats.presents) return b.stats.presents - a.stats.presents;
    return a.name.localeCompare(b.name);
  });

  if (sortedStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          ⚽ Aucun élève enregistré. Ajoutez un élève ou chargez les données de démo !
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = sortedStudents.map((student, index) => {
    const rank = index + 1;
    
    // Mise en évidence du podium uniquement
    const zoneClass = rank <= 3 ? 'row-champion' : '';

    // Badge du rang
    let rankBadgeClass = 'rank-other';
    if (rank === 1) rankBadgeClass = 'rank-1';
    else if (rank === 2) rankBadgeClass = 'rank-2';
    else if (rank === 3) rankBadgeClass = 'rank-3';

    return `
      <tr class="${zoneClass}">
        <td>
          <span class="rank-badge ${rankBadgeClass}">${rank}</span>
        </td>
        <td>
          <span class="player-name">${escapeHtml(student.name)}</span>
        </td>
        <td><strong>${student.stats.sessionsCount}</strong> j.</td>
        <td><span style="color:var(--accent-green);">🟢 ${student.stats.presents}</span></td>
        <td><span style="color:var(--accent-yellow);">🟡 ${student.stats.lateShort}</span></td>
        <td><span style="color:var(--accent-red);">🔴 ${student.stats.absents}</span></td>
        <td>
          <span class="points-highlight">${student.points} pts</span>
        </td>
        <td>
          <button class="btn btn-secondary btn-adjust-pts" data-id="${student.id}" title="Ajuster les points à une date précise">
            ⚙️ Points
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/** Sécurise l'affichage HTML pour éviter le XSS */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
