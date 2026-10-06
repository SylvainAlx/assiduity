/**
 * js/state.js - Gestionnaire d'État Global (State Management)
 * Gère les données de la Ligue et réagit aux modifications avec notification des composants UI.
 */

import { loadFromStorage, saveToStorage, clearStorage } from './storage.js';
import { createStudent, createHistoryEntry, getDemoData, ATTENDANCE_RULES, DEFAULT_LEAGUE_SETTINGS } from './models.js';

class AppState {
  constructor() {
    this.students = [];
    this.history = [];
    this.totalSessions = 0;
    this.settings = { ...DEFAULT_LEAGUE_SETTINGS };
    this.listeners = [];
  }

  /** Initialise l'état au démarrage de l'application */
  init() {
    const saved = loadFromStorage();
    if (saved && Array.isArray(saved.students) && saved.students.length > 0) {
      this.students = saved.students.map(stripRemovedStudentFields);
      this.history = saved.history || [];
      this.totalSessions = saved.totalSessions || 0;
      this.settings = { ...DEFAULT_LEAGUE_SETTINGS, ...(saved.settings || {}) };
    } else {
      this.loadDemoData();
    }
  }

  /** S'abonne aux changements d'état */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /** Notifie tous les abonnés et sauvegarde automatiquement */
  notify() {
    saveToStorage({
      students: this.students,
      history: this.history,
      totalSessions: this.totalSessions,
      settings: this.settings
    });
    this.listeners.forEach(fn => fn(this));
  }

  /** Met à jour la configuration de la Ligue */
  updateSettings(title, coach, themeColor) {
    this.settings = {
      title: title ? title.trim() : DEFAULT_LEAGUE_SETTINGS.title,
      coach: coach ? coach.trim() : DEFAULT_LEAGUE_SETTINGS.coach,
      themeColor: themeColor || DEFAULT_LEAGUE_SETTINGS.themeColor
    };
    this.notify();
  }

  /** Charge le jeu de démo */
  loadDemoData() {
    const demo = getDemoData();
    this.students = demo.students;
    this.history = demo.history;
    this.totalSessions = demo.totalSessions;
    this.settings = demo.settings || { ...DEFAULT_LEAGUE_SETTINGS };
    this.notify();
  }

  /** Remplace tout l'état (ex: lors d'un import JSON) */
  replaceState(data) {
    this.students = (data.students || []).map(stripRemovedStudentFields);
    this.history = data.history || [];
    this.totalSessions = data.totalSessions || 0;
    this.settings = { ...DEFAULT_LEAGUE_SETTINGS, ...(data.settings || {}) };
    this.notify();
  }

  /** Efface toutes les données */
  resetAll() {
    clearStorage();
    this.students = [];
    this.history = [];
    this.totalSessions = 0;
    this.settings = { ...DEFAULT_LEAGUE_SETTINGS };
    this.notify();
  }

  /** Ajoute un nouvel élève */
  addStudent(name) {
    const newStudent = createStudent(name);
    this.students.push(newStudent);
    this.notify();
    return newStudent;
  }

  /** Met à jour les infos d'un élève */
  updateStudent(id, name) {
    const student = this.students.find(s => s.id === id);
    if (student) {
      student.name = name.trim();
      this.notify();
    }
  }

  /** Supprime un élève */
  deleteStudent(id) {
    this.students = this.students.filter(s => s.id !== id);
    this.notify();
  }

  /** Ajuste avec précision les points d'un élève avec une date donnée */
  adjustStudentPoints(studentId, delta, dateStr, reason) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    student.points += parseInt(delta, 10);
    if (student.points < 0) student.points = 0; // Pas de points négatifs

    const entry = createHistoryEntry(student.id, student.name, dateStr, delta, reason, 'manual');
    this.history.unshift(entry); // Ajouter au début du journal
    this.notify();
  }

  /** Enregistre une session d'appel complète */
  processRollCall(dateStr, records) {
    this.totalSessions += 1;
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    records.forEach(rec => {
      const student = this.students.find(s => s.id === rec.studentId);
      if (!student) return;

      let ruleKey = 'PRESENT';
      if (rec.status === 'late_short') ruleKey = 'LATE_SHORT';
      if (rec.status === 'absent') ruleKey = 'ABSENT';

      const rule = ATTENDANCE_RULES[ruleKey];
      student.points += rule.points;
      student.stats.sessionsCount += 1;

      if (ruleKey === 'PRESENT') student.stats.presents += 1;
      if (ruleKey === 'LATE_SHORT') student.stats.lateShort += 1;
      if (ruleKey === 'ABSENT') student.stats.absents += 1;

      // Historique des 5 derniers résultats de forme
      student.recentForm.unshift(rule.code);
      if (student.recentForm.length > 5) student.recentForm.pop();

      // Entrée d'historique
      const entry = createHistoryEntry(
        student.id,
        student.name,
        dateStr,
        rule.points,
        `Séance du ${dateStr} : ${rule.label} (+${rule.points} pt${rule.points > 1 ? 's' : ''})`,
        'rollcall',
        { status: rec.status, sessionId }
      );
      this.history.unshift(entry);
    });

    this.notify();
  }

  /** Corrige le statut d'un appel déjà enregistré. */
  editRollCall(historyId, newStatus) {
    const entry = this.history.find(item => item.id === historyId && item.type === 'rollcall');
    if (!entry) return false;

    const student = this.students.find(item => item.id === entry.studentId);
    if (!student) return false;

    const oldStatus = getRollCallStatus(entry);
    const normalizedStatus = normalizeRollCallStatus(newStatus);
    if (!normalizedStatus) return false;

    const oldRule = ATTENDANCE_RULES[statusToRuleKey(oldStatus)];
    const newRule = ATTENDANCE_RULES[statusToRuleKey(normalizedStatus)];

    student.points = Math.max(0, student.points + newRule.points - oldRule.points);
    decrementAttendanceStat(student, oldStatus);
    incrementAttendanceStat(student, normalizedStatus);

    entry.status = normalizedStatus;
    entry.delta = newRule.points;
    entry.reason = `Séance du ${entry.date} : ${newRule.label} (+${newRule.points} pt${newRule.points > 1 ? 's' : ''})`;
    entry.editedAt = new Date().toISOString();
    entry.studentName = student.name;

    // Les anciennes démos peuvent ne contenir qu'une partie de l'historique.
    // Dans ce cas, on conserve leur forme existante plutôt que de la reconstruire incomplètement.
    const rollcallEntries = this.history.filter(item => item.type === 'rollcall' && item.studentId === student.id);
    if (rollcallEntries.length >= student.stats.sessionsCount) {
      student.recentForm = rollcallEntries
        .sort(compareHistoryEntriesByDateDesc)
        .slice(0, 5)
        .map(item => ATTENDANCE_RULES[statusToRuleKey(getRollCallStatus(item))].code);
    }

    this.notify();
    return true;
  }
}

function normalizeRollCallStatus(status) {
  return ['present', 'late_short', 'absent'].includes(status) ? status : null;
}

function statusToRuleKey(status) {
  if (status === 'late_short') return 'LATE_SHORT';
  if (status === 'absent') return 'ABSENT';
  return 'PRESENT';
}

function getRollCallStatus(entry) {
  if (normalizeRollCallStatus(entry.status)) return entry.status;
  if (Number(entry.delta) === ATTENDANCE_RULES.PRESENT.points) return 'present';
  if (Number(entry.delta) === ATTENDANCE_RULES.LATE_SHORT.points) return 'late_short';
  return 'absent';
}

function decrementAttendanceStat(student, status) {
  student.stats.sessionsCount = Math.max(0, student.stats.sessionsCount - 1);
  if (status === 'present') student.stats.presents = Math.max(0, student.stats.presents - 1);
  if (status === 'late_short') student.stats.lateShort = Math.max(0, student.stats.lateShort - 1);
  if (status === 'absent') student.stats.absents = Math.max(0, student.stats.absents - 1);
}

function incrementAttendanceStat(student, status) {
  student.stats.sessionsCount += 1;
  if (status === 'present') student.stats.presents += 1;
  if (status === 'late_short') student.stats.lateShort += 1;
  if (status === 'absent') student.stats.absents += 1;
}

function compareHistoryEntriesByDateDesc(a, b) {
  const dateComparison = String(b.date || '').localeCompare(String(a.date || ''));
  if (dateComparison !== 0) return dateComparison;
  return String(b.timestamp || '').localeCompare(String(a.timestamp || ''));
}

/** Retire les anciennes informations de personnalisation lors d'un chargement. */
function stripRemovedStudentFields(student) {
  const { jerseyNumber, role, avatar, ...cleanStudent } = student;
  return cleanStudent;
}

export const state = new AppState();
