/**
 * js/models.js - Modèles de données et règles de la Ligue d'Assiduité
 * Fichier pédagogique : contient la structure des objets Élève et Historique.
 */

// Barème officiel d'assiduité (Ligue de Football)
export const ATTENDANCE_RULES = {
  PRESENT: { points: 3, label: 'Présent', code: 'W', emoji: '🟢' },
  LATE_SHORT: { points: 1, label: 'Retard < 5min', code: 'D', emoji: '🟡' },
  ABSENT: { points: 0, label: 'Retard > 5min / Absent', code: 'L', emoji: '🔴' }
};

/**
 * Fabrique un objet Élève (Joueur)
 */
export function createStudent(name) {
  return {
    id: 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    points: 0,
    stats: {
      presents: 0,
      lateShort: 0,
      absents: 0,
      sessionsCount: 0
    },
    recentForm: [] // Tableau des 5 derniers résultats ['W', 'D', 'L', ...]
  };
}

/**
 * Fabrique une entrée d'Historique datée
 */
export function createHistoryEntry(studentId, studentName, dateStr, delta, reason, type = 'manual') {
  return {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    studentId: studentId,
    studentName: studentName,
    date: dateStr || new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    delta: parseInt(delta, 10),
    reason: reason,
    type: type // 'rollcall' (appel) ou 'manual' (ajustement précis)
  };
}

export const DEFAULT_LEAGUE_SETTINGS = {
  title: "Ligue d'Assiduité",
  coach: "Coach Enseignant",
  themeColor: "#00E676"
};

/**
 * Jeu de données de démonstration pour démarrer rapidement
 */
export function getDemoData() {
  const demoStudents = [
    { name: 'Kylian Mbappé', points: 18, stats: { presents: 6, lateShort: 0, absents: 0, sessionsCount: 6 }, form: ['W','W','W','W','W'] },
    { name: 'Antoine Griezmann', points: 16, stats: { presents: 5, lateShort: 1, absents: 0, sessionsCount: 6 }, form: ['W','W','D','W','W'] },
    { name: 'N\'Golo Kanté', points: 15, stats: { presents: 5, lateShort: 0, absents: 1, sessionsCount: 6 }, form: ['W','W','W','L','W'] },
    { name: 'Jules Koundé', points: 13, stats: { presents: 4, lateShort: 1, absents: 1, sessionsCount: 6 }, form: ['W','D','W','L','W'] },
    { name: 'Mike Maignan', points: 12, stats: { presents: 4, lateShort: 0, absents: 2, sessionsCount: 6 }, form: ['W','L','W','W','L'] },
    { name: 'Ousmane Dembélé', points: 9, stats: { presents: 2, lateShort: 3, absents: 1, sessionsCount: 6 }, form: ['D','D','W','L','D'] },
    { name: 'Marcus Thuram', points: 7, stats: { presents: 2, lateShort: 1, absents: 3, sessionsCount: 6 }, form: ['L','W','L','D','L'] }
  ];

  const today = new Date().toISOString().split('T')[0];
  
  const students = demoStudents.map(ds => {
    const s = createStudent(ds.name);
    s.points = ds.points;
    s.stats = ds.stats;
    s.recentForm = ds.form;
    return s;
  });

  const history = [
    createHistoryEntry(students[0].id, students[0].name, today, 3, 'Présent au cours de Web', 'rollcall'),
    createHistoryEntry(students[1].id, students[1].name, today, 1, 'Retard < 5min (Transports)', 'rollcall'),
    createHistoryEntry(students[2].id, students[2].name, today, 3, 'Présent & Participation active (+3)', 'manual')
  ];

  return { 
    students, 
    history, 
    totalSessions: 6,
    settings: { ...DEFAULT_LEAGUE_SETTINGS }
  };
}
