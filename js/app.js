/**
 * js/app.js - Point d'Entrée Principal de l'Application "Ligue d'Assiduité"
 * Connecte le state réactif, l'interface utilisateur, la navigation, les modales et la personnalisation.
 */

import { state } from './state.js';
import { exportToJSONFile, importFromJSONFile } from './storage.js';
import { renderLeaderboard } from './ui/leaderboard.ui.js';
import { renderRollCall, initRollCallDate, getRollCallSelections } from './ui/rollcall.ui.js';
import { renderStudents } from './ui/students.ui.js';
import { renderHistory } from './ui/history.ui.js';

document.addEventListener('DOMContentLoaded', () => {
  state.init();
  initRollCallDate();

  state.subscribe(updateAllUI);
  updateAllUI();

  setupTabNavigation();
  setupModalEvents();
  setupRollCallEvents();
  setupBackupEvents();
  setupDynamicDelegationEvents();
});

/** Met à jour toutes les vues UI, l'en-tête et le thème de couleur */
function updateAllUI() {
  renderLeaderboard();
  renderRollCall();
  renderStudents();
  renderHistory();
  updateHeaderStats();
  updateLeagueHeaderAndTheme();
}

/** Calcule et affiche les statistiques globales dans l'en-tête */
function updateHeaderStats() {
  const totalStudents = state.students.length;
  const totalPoints = state.students.reduce((sum, s) => sum + s.points, 0);
  const totalPresents = state.students.reduce((sum, s) => sum + s.stats.presents, 0);
  const totalAttendanceOpportunities = state.students.reduce((sum, s) => sum + s.stats.sessionsCount, 0);

  const rate = totalAttendanceOpportunities > 0 
    ? Math.round((totalPresents / totalAttendanceOpportunities) * 100) 
    : 100;

  document.getElementById('stat-total-students').textContent = totalStudents;
  document.getElementById('stat-attendance-rate').textContent = `${rate}%`;
  document.getElementById('stat-total-points').textContent = totalPoints;
  document.getElementById('stat-total-sessions').textContent = state.totalSessions;
}

/** Met à jour le titre, le nom du coach et la couleur principale dynamique */
function updateLeagueHeaderAndTheme() {
  const titleEl = document.getElementById('header-league-title');
  const coachEl = document.getElementById('header-coach-name');

  if (titleEl) titleEl.textContent = state.settings.title;
  if (coachEl) coachEl.textContent = `Coach : ${state.settings.coach}`;

  // Application dynamique de la couleur principale personnalisée
  if (state.settings.themeColor) {
    document.documentElement.style.setProperty('--accent-green', state.settings.themeColor);
  }
}

/** Gestion de la Navigation par Onglets */
function setupTabNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-${tabId}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  document.getElementById('btn-quick-rollcall')?.addEventListener('click', () => {
    document.querySelector('.nav-btn[data-tab="rollcall"]')?.click();
  });
}

/** Gestion des Événements des Modales (Création/Ajustement/Configuration) */
function setupModalEvents() {
  const modalStudent = document.getElementById('modal-student');
  const modalPoints = document.getElementById('modal-points');
  const modalSettings = document.getElementById('modal-settings');

  // Modale Configuration de la Ligue
  const openSettings = () => {
    document.getElementById('setting-title').value = state.settings.title;
    document.getElementById('setting-coach').value = state.settings.coach;
    document.getElementById('setting-color').value = state.settings.themeColor;
    modalSettings.classList.remove('hidden');
  };

  document.getElementById('btn-open-settings')?.addEventListener('click', openSettings);
  document.getElementById('btn-tab-open-settings')?.addEventListener('click', openSettings);

  // Soumission Formulaire Configuration
  document.getElementById('form-settings')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('setting-title').value;
    const coach = document.getElementById('setting-coach').value;
    const color = document.getElementById('setting-color').value;
    state.updateSettings(title, coach, color);
    modalSettings.classList.add('hidden');
  });

  // Boutons de préréglage de couleurs
  document.querySelectorAll('.preset-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const hex = btn.getAttribute('data-color');
      if (hex) document.getElementById('setting-color').value = hex;
    });
  });

  // Modale Élève
  const openAddModal = () => {
    document.getElementById('modal-student-title').textContent = 'Ajouter un nouvel élève';
    document.getElementById('form-student').reset();
    document.getElementById('student-edit-id').value = '';
    modalStudent.classList.remove('hidden');
  };

  document.getElementById('btn-quick-add-student')?.addEventListener('click', openAddModal);
  document.getElementById('btn-add-student-modal')?.addEventListener('click', openAddModal);

  document.getElementById('form-student')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('student-edit-id').value;
    const name = document.getElementById('student-name').value;
    const jersey = document.getElementById('student-number').value;
    const role = document.getElementById('student-role').value;
    const avatar = document.getElementById('student-avatar').value;

    if (editId) state.updateStudent(editId, name, jersey, role, avatar);
    else state.addStudent(name, jersey, role, avatar);

    modalStudent.classList.add('hidden');
  });

  // Modale Points
  document.getElementById('form-adjust-points')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = document.getElementById('adjust-student-id').value;
    const delta = document.getElementById('adjust-delta').value;
    const date = document.getElementById('adjust-date').value;
    const reason = document.getElementById('adjust-reason').value;

    if (studentId && delta && date && reason) {
      state.adjustStudentPoints(studentId, parseInt(delta, 10), date, reason);
      modalPoints.classList.add('hidden');
    }
  });

  // Fermeture des modales
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      modalStudent.classList.add('hidden');
      modalPoints.classList.add('hidden');
      modalSettings.classList.add('hidden');
    });
  });
}

/** Enregistrement d'une séance d'Appel */
function setupRollCallEvents() {
  document.getElementById('btn-submit-rollcall')?.addEventListener('click', () => {
    const dateStr = document.getElementById('rollcall-date').value;
    if (!dateStr) return alert('Veuillez sélectionner une date.');
    const records = getRollCallSelections();
    if (records.length === 0) return alert('Aucun élève à enregistrer.');

    state.processRollCall(dateStr, records);
    alert(`✅ Séance du ${dateStr} enregistrée avec succès !`);
    document.querySelector('.nav-btn[data-tab="leaderboard"]')?.click();
  });
}

/** Sauvegarde, Importation et Démo */
function setupBackupEvents() {
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    exportToJSONFile({
      students: state.students,
      history: state.history,
      totalSessions: state.totalSessions,
      settings: state.settings
    });
  });

  const fileInput = document.getElementById('input-import-json');
  document.getElementById('btn-trigger-import')?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importFromJSONFile(file);
      state.replaceState(data);
      alert('🎉 Sauvegarde de la Ligue chargée avec succès !');
    } catch (err) {
      alert(`⚠️ Erreur d'importation : ${err.message}`);
    } finally {
      fileInput.value = '';
    }
  });

  document.getElementById('btn-load-demo')?.addEventListener('click', () => {
    if (confirm('Voulez-vous charger les données de démonstration ?')) state.loadDemoData();
  });

  document.getElementById('btn-reset-all')?.addEventListener('click', () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir tout effacer ? Action irréversible.')) state.resetAll();
  });
}

/** Événements délégués */
function setupDynamicDelegationEvents() {
  document.addEventListener('click', (e) => {
    const target = e.target;
    const btnAdjust = target.closest('.btn-adjust-pts');
    if (btnAdjust) {
      const studentId = btnAdjust.getAttribute('data-id');
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        document.getElementById('adjust-student-id').value = student.id;
        document.getElementById('modal-points-student-name').textContent = `de ${student.name}`;
        document.getElementById('adjust-delta').value = '1';
        document.getElementById('adjust-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('adjust-reason').value = '';
        document.getElementById('modal-points').classList.remove('hidden');
      }
      return;
    }

    const btnEdit = target.closest('.btn-edit-student');
    if (btnEdit) {
      const studentId = btnEdit.getAttribute('data-id');
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        document.getElementById('modal-student-title').textContent = `Éditer ${student.name}`;
        document.getElementById('student-edit-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-number').value = student.jerseyNumber;
        document.getElementById('student-role').value = student.role;
        document.getElementById('student-avatar').value = student.avatar;
        document.getElementById('modal-student').classList.remove('hidden');
      }
      return;
    }

    const btnDelete = target.closest('.btn-delete-student');
    if (btnDelete) {
      const studentId = btnDelete.getAttribute('data-id');
      const student = state.students.find(s => s.id === studentId);
      if (student && confirm(`Voulez-vous vraiment retirer ${student.name} du championnat ?`)) {
        state.deleteStudent(studentId);
      }
    }
  });

  document.getElementById('filter-history-student')?.addEventListener('change', () => renderHistory());
}
